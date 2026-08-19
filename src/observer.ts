import type { HookEvent } from './core/hooks.js'
import type { HookHandler } from './core/handlers.js'
import type { PayloadNormalizer } from './core/payloads/hook.payload.js'
import type { IO, IOProvider } from './io.js'
import { createLogger } from './logger.js'
import { HookError } from './core/errors/hook.error.js'
import { BlockingHookError } from './core/errors/blocking.error.js'

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

export function createObserver(ioProvider: IOProvider): Observer {

  const observer: Observer = {
    io: ioProvider(),
    pool: {
      PreToolUse: new Map(),
      PostToolUse: new Map(),
      Notification: new Map(),
      Stop: new Map(),
      SubagentStop: new Map(),
      UserPromptSubmit: new Map(),
      PreCompact: new Map(),
      SessionStart: new Map(),
    },
    normalizers: {},

    subscribe<E extends HookEvent>(hookName: E, eventName: string, handler: HookHandler<E>): Observer {
      // Cast needed: TypeScript cannot narrow a mapped-type index at the call site.
      // Type safety is guaranteed by the generic E constraint above.
      ;(observer.pool[hookName] as Map<string, HookHandler<HookEvent>>).set(
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
        observer.io.out.write(JSON.stringify({}))
        return
      }

      const rawPayload = await observer.io.in.json() as Record<string, unknown>
      log.debug('received payload: {payload}', () => ({ payload: rawPayload }))

      const normalizer = observer.normalizers[hookName]
      const payload: Record<string, unknown> = normalizer
        ? await (normalizer as PayloadNormalizer<HookEvent>).normalise(rawPayload) as unknown as Record<string, unknown>
        : rawPayload

      try {
        const toolName = (hookName === 'PostToolUse' || hookName === 'PreToolUse') &&
          typeof payload['tool_name'] === 'string' ?
          (payload['tool_name'] as string) : undefined

        log.info('handler invoked: {hookName}, {eventName}', { hookName, eventName, ...(toolName !== undefined && { tool_name: toolName }) })

        const response = await (handler as (p: unknown) => Promise<unknown>)(payload)
        observer.io.out.write(JSON.stringify(response))

        log.info('handler completed: {hookName}, {eventName}', { hookName, eventName })
      } catch (err) {
        if (err instanceof HookError) {
          const isNonBlockable = hookName === 'PostToolUse' || hookName === 'Notification' || hookName === 'SessionStart'
          if (err instanceof BlockingHookError && isNonBlockable) {
            log.warn('BlockingHookError thrown from non-blockable hook {hookName} — downgrading to non-blocking', { hookName })
            observer.io.out.write(JSON.stringify({ continue: true }))
          } else {
            await err.process(observer.io)
          }
          process.exit(err.exitCode)
        }
        log.error('unhandled handler error: {err}', { err })
        observer.io.out.write(JSON.stringify({ continue: true }))
        if (err instanceof Error) observer.io.err.write(`${err.stack ?? err.message}\n`)
      }
    },
  }

  return observer
}
