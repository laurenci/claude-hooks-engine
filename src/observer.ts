import type { HookEvent } from './core/hooks.js'
import type { HookHandler } from './core/handlers.js'
import type { PayloadNormalizer } from './core/hooks/hook-payload.js'
import type { IO, IOProvider } from './io.js'
import { createLogger } from './logger.js'
import { isHookError, type HookError } from './core/hooks/hook-error.js'

const log = createLogger('observer', 'payload')

type SubscribersPool = {
  [E in HookEvent]: Map<string, HookHandler<E>>
}

type NormalizersPool = {
  [E in HookEvent]?: PayloadNormalizer<E>
}

interface Observer {
  io: IO
  pool: SubscribersPool
  normalizers: NormalizersPool
  subscribe: <E extends HookEvent>(hookName: E, eventName: string, handler: HookHandler<E>) => Observer
  withNormalizer: <E extends HookEvent>(hookName: E, normalizer: PayloadNormalizer<E>) => Observer
  notify: (hookName: HookEvent, eventName: string) => Promise<void>
}

function handleNonHookError(io: IO, errorMessage: string) {
  io.out.write(JSON.stringify({
    continue: true,
    systemMessage: errorMessage
  }))
  io.err.write(errorMessage)
}

function handleHookError(io: IO, hookName: string, err : HookError) {
  const isNonBlockable = hookName === 'PostToolUse' || hookName === 'Notification' || hookName === 'SessionStart' || hookName === 'SubagentStart'
  if (err.kind === 'blocking' && isNonBlockable) {
    log.warn('BlockingHookError thrown from non-blockable hook {hookName} — downgrading to non-blocking', { hookName })
    io.out.write(JSON.stringify({ continue: true }))
  } else if (err.outMessage !== undefined) {
    io.out.write(JSON.stringify(err.outMessage))
  }
  if (err.errMessage !== undefined) io.err.write(err.errMessage)
}

export function createObserver(ioProvider: IOProvider): Observer {

  const observer: Observer = {
    io: ioProvider(),
    pool: {
      PreToolUse: new Map(),
      PostToolUse: new Map(),
      Notification: new Map(),
      Stop: new Map(),
      SubagentStart: new Map(),
      SubagentStop: new Map(),
      UserPromptSubmit: new Map(),
      PreCompact: new Map(),
      SessionStart: new Map(),
    },
    normalizers: {},

    subscribe<E extends HookEvent>(hookName: E, eventName: string, handler: HookHandler<E>): Observer {
      // Cast needed: TypeScript cannot narrow a mapped-type index at the call site.
      // Type safety is guaranteed by the generic E constraint above.
      (observer.pool[hookName] as Map<string, HookHandler<HookEvent>>).set(
        eventName,
        handler as unknown as HookHandler<HookEvent>,
      )
      log.info('handler registered: {hookName}, {eventName}', { hookName, eventName })
      return observer
    },

    withNormalizer<E extends HookEvent>(hookName: E, normalizer: PayloadNormalizer<E>): Observer {
      (observer.normalizers as Record<string, unknown>)[hookName] = normalizer
      return observer
    },

    async notify(hookName: HookEvent, eventName: string): Promise<void> {
      log.info('notify invoked: {hookName}, {eventName}', { hookName, eventName })

      const handler = (observer.pool[hookName] as Map<string, HookHandler<HookEvent>>).get(eventName)
      if (!handler) {
        log.warn('no handler found: {hookName}, {eventName}', { hookName, eventName })
        handleNonHookError(observer.io, `no handler found: ${hookName}, ${eventName}`)
        return
      }

      const rawPayload = await observer.io.in.json() as Record<string, unknown>
      log.debug('received payload: {payload}', () => ({ payload: rawPayload }));

      const normalizer = observer.normalizers[hookName]
      const payload: Record<string, unknown> = normalizer
        ? await (normalizer as PayloadNormalizer<HookEvent>).normalise(rawPayload) as unknown as Record<string, unknown>
        : rawPayload;

      try {
        log.info('handler invoked: {hookName}, {eventName}', { hookName, eventName })

        const response = await (handler as (p: unknown) => Promise<unknown>)(payload)
        observer.io.out.write(JSON.stringify(response))

        log.info('handler completed: {hookName}, {eventName}', { hookName, eventName })
      } catch (err) {
        if (isHookError(err)) {
          handleHookError(observer.io, hookName, err);
          // Exit with the original error code (typically 2 for HookErrors) even if response was downgraded.
          // The stdout payload controls Claude Code's block/continue decision; the exit code signals to the OS
          // that this hook execution encountered an error condition, which is always true when HookError is thrown.
          process.exit(err.exitCode);
        }
        log.error('unhandled handler error: {err}', { err })
        if (err instanceof Error) handleNonHookError(observer.io, err.message);
      }
    },
  }

  return observer
}
