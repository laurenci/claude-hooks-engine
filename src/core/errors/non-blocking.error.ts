import { HookError } from './hook.error.js'

export interface NonBlockingHookErrorOptions {
  /** Written to stdout as `systemMessage` — visible in the Claude session. */
  reason?: string
  /** Written to stderr — visible in Claude Code debug logs only. */
  stdErrMessage?: string
}

/**
 * Abstract base for errors that allow Claude Code to continue.
 *
 * When caught by `notify()`, the process exits with code 0.
 * If `reason` is provided it surfaces in the Claude session as a
 * `systemMessage`. `stdErrMessage` goes to stderr (debug logs only).
 *
 * Use a hook-specific subclass (e.g. `SessionStart.NonBlockingError`)
 * to attach optional hook-specific response fields.
 *
 * @example
 * throw new Stop.NonBlockingError({ reason: 'Handler skipped: feature flag off' })
 */
export abstract class NonBlockingHookError extends HookError {
  readonly exitCode = 0
  readonly reason?: string
  readonly stdErrMessage?: string

  constructor(options?: NonBlockingHookErrorOptions) {
    super('Non-blocking hook error')
    this.reason = options?.reason
    this.stdErrMessage = options?.stdErrMessage
  }
}
