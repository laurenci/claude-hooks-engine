import type { IO } from '../../../io.js'
import { BlockingHookError } from '../blocking.error.js'
import { NonBlockingHookError } from '../non-blocking.error.js'

export namespace PreCompact {
  /**
   * Thrown from a `PreCompact` handler to block context compaction.
   *
   * Produces `{ decision: 'block', reason }` on stdout. Exits with code 2.
   *
   * @example
   * throw new PreCompact.BlockingError('Compaction blocked: active transaction in progress')
   */
  export class BlockingError extends BlockingHookError {
    readonly reason: string

    constructor(reason: string, stdErrMessage?: string) {
      super(stdErrMessage)
      this.reason = reason
    }

    async process(io: IO): Promise<void> {
      io.out.write(JSON.stringify({ decision: 'block', reason: this.reason }))
      await this.writeStdErr(io)
    }
  }

  /**
   * Thrown from a `PreCompact` handler to signal a non-fatal error.
   *
   * Produces `{ continue: true, systemMessage? }` on stdout. Exits with code 0.
   *
   * @example
   * throw new PreCompact.NonBlockingError({ reason: 'Pre-compact snapshot failed' })
   */
  export class NonBlockingError extends NonBlockingHookError {
    async process(io: IO): Promise<void> {
      const response: Record<string, unknown> = { continue: true }
      if (this.reason) response.systemMessage = this.reason
      io.out.write(JSON.stringify(response))
      if (this.stdErrMessage) io.err.write(this.stdErrMessage)
    }
  }
}
