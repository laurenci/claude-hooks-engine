import type { IO } from '../../../io.js'
import { BlockingHookError } from '../blocking.error.js'
import { NonBlockingHookError } from '../non-blocking.error.js'

export namespace UserPromptSubmit {
  /**
   * Thrown from a `UserPromptSubmit` handler to block a prompt from being processed.
   *
   * Produces `{ decision: 'block', reason }` on stdout. Exits with code 2.
   *
   * @example
   * throw new UserPromptSubmit.BlockingError('Prompt contains prohibited content')
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
   * Thrown from a `UserPromptSubmit` handler to signal a non-fatal error.
   *
   * Produces `{ continue: true, systemMessage? }` on stdout. Exits with code 0.
   *
   * @example
   * throw new UserPromptSubmit.NonBlockingError({ reason: 'Prompt enrichment failed, forwarding as-is' })
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
