import type { IO } from '../../../io.js'
import { NonBlockingHookError } from '../non-blocking.error.js'

export namespace Notification {
  /**
   * Thrown from a `Notification` handler to signal a non-fatal error.
   *
   * `Notification` does **not** support blocking — there is no `BlockingError`
   * for this hook.
   *
   * Produces `{ continue: true, systemMessage? }` on stdout. Exits with code 0.
   *
   * **Note:** Claude Code discards `systemMessage` for `Notification` hooks — `reason`
   * will be written to stdout but will not surface in the Claude session.
   *
   * @example
   * throw new Notification.NonBlockingError({ reason: 'Notification handler failed gracefully' })
   */
  export class NonBlockingError extends NonBlockingHookError {
    override async process(io: IO): Promise<void> {
      const response: Record<string, unknown> = { continue: true }
      if (this.reason) response.systemMessage = this.reason
      io.out.write(JSON.stringify(response))
      if (this.stdErrMessage) io.err.write(this.stdErrMessage)
    }
  }
}
