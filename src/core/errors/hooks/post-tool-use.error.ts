import type { IO } from '../../../io.js'
import { NonBlockingHookError } from '../non-blocking.error.js'
import type { PostToolUseResponse } from '../../responses/post-tool-use.response.js'

export interface PostToolUseNonBlockingOptions {
  reason?: string
  stdErrMessage?: string
  /** Optional partial response merged onto stdout. `continue` is always set to true regardless. */
  response?: Omit<PostToolUseResponse, 'continue'>
}

export namespace PostToolUse {
  /**
   * Thrown from a `PostToolUse` handler to signal a non-fatal error.
   *
   * `PostToolUse` does **not** support blocking — there is no `BlockingError`
   * for this hook. Throwing a `BlockingHookError` from a `PostToolUse` handler
   * triggers a runtime guard in `notify()` that downgrades it to non-blocking.
   *
   * Produces `{ continue: true, systemMessage?, ...response }` on stdout. Exits with code 0.
   *
   * @example
   * throw new PostToolUse.NonBlockingError({
   *   reason: 'Audit log failed',
   *   response: { hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: 'retried 3x' } }
   * })
   */
  export class NonBlockingError extends NonBlockingHookError {
    private readonly partialResponse?: Omit<PostToolUseResponse, 'continue'>

    constructor(options?: PostToolUseNonBlockingOptions) {
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
