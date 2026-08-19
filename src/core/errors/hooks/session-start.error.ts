import type { IO } from '../../../io.js'
import { NonBlockingHookError } from '../non-blocking.error.js'
import type { SessionStartResponse } from '../../responses/session-start.response.js'

export interface SessionStartNonBlockingOptions {
  reason?: string
  stdErrMessage?: string
  /** Optional partial response merged onto stdout. `continue` is always set to true regardless. */
  response?: Omit<SessionStartResponse, 'continue'>
}

export namespace SessionStart {
  /**
   * Thrown from a `SessionStart` handler to signal a non-fatal error.
   *
   * `SessionStart` does **not** support blocking — there is no `BlockingError`
   * for this hook.
   *
   * Produces `{ continue: true, systemMessage?, ...response }` on stdout. Exits with code 0.
   * Use `response` to pass partial session context even on the error path
   * (e.g. `additionalContext`, `watchPaths`).
   *
   * @example
   * throw new SessionStart.NonBlockingError({
   *   reason: 'Config load failed, using defaults',
   *   response: { hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: 'defaults applied' } }
   * })
   */
  export class NonBlockingError extends NonBlockingHookError {
    private readonly partialResponse?: Omit<SessionStartResponse, 'continue'>

    constructor(options?: SessionStartNonBlockingOptions) {
      super(options)
      this.partialResponse = options?.response
    }

    override async process(io: IO): Promise<void> {
      const response: Record<string, unknown> = { continue: true, ...this.partialResponse }
      if (this.reason) response.systemMessage = this.reason
      io.out.write(JSON.stringify(response))
      if (this.stdErrMessage) io.err.write(this.stdErrMessage)
    }
  }
}
