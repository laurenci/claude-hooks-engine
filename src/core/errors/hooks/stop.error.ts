import type { IO } from '../../../io.js'
import { BlockingHookError } from '../blocking.error.js'
import { NonBlockingHookError } from '../non-blocking.error.js'

export namespace Stop {
  /**
   * Thrown from a `Stop` handler to block Claude from stopping.
   *
   * Produces `{ decision: 'block', reason }` on stdout. Exits with code 2.
   *
   * @example
   * throw new Stop.BlockingError('Tests have not passed yet')
   */
  export class BlockingError extends BlockingHookError {
    readonly reason: string

    constructor(reason: string, stdErrMessage?: string) {
      super(stdErrMessage)
      this.reason = reason
    }

    override async process(io: IO): Promise<void> {
      io.out.write(JSON.stringify({ decision: 'block', reason: this.reason }))
      await this.writeStdErr(io)
    }
  }

  /**
   * Thrown from a `Stop` handler to signal a non-fatal error.
   *
   * Produces `{ continue: true, systemMessage? }` on stdout. Exits with code 0.
   *
   * @example
   * throw new Stop.NonBlockingError({ reason: 'Cleanup step failed, continuing' })
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
