import type { IO } from '../../../io.js'
import { BlockingHookError } from '../blocking.error.js'
import { NonBlockingHookError } from '../non-blocking.error.js'

export namespace PreToolUse {
  /**
   * Thrown from a `PreToolUse` handler to deny tool execution.
   *
   * Produces `{ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason } }` on stdout.
   * Exits with code 2.
   *
   * @example
   * throw new PreToolUse.BlockingError('Bash is disabled in this project')
   */
  export class BlockingError extends BlockingHookError {
    readonly permissionDecisionReason: string

    constructor(permissionDecisionReason: string, stdErrMessage?: string) {
      super(stdErrMessage)
      this.permissionDecisionReason = permissionDecisionReason
    }

    override async process(io: IO): Promise<void> {
      io.out.write(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: this.permissionDecisionReason,
        },
      }))
      await this.writeStdErr(io)
    }
  }

  /**
   * Thrown from a `PreToolUse` handler to signal a non-fatal error.
   *
   * Produces `{ continue: true, systemMessage? }` on stdout. Exits with code 0.
   *
   * @example
   * throw new PreToolUse.NonBlockingError({ reason: 'Audit log write failed, proceeding anyway' })
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
