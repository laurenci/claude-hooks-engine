import type { IO } from '../../io.js'
import { HookError } from './hook.error.js'

/**
 * Abstract base for errors that block Claude Code from proceeding.
 *
 * When caught by `notify()` on a blockable hook (`PreToolUse`,
 * `UserPromptSubmit`, `Stop`, `SubagentStop`, `PreCompact`), the
 * process exits with code 2.
 *
 * Use a hook-specific subclass (e.g. `PreToolUse.BlockingError`) so the
 * response shape is enforced by the type system.
 *
 * @example
 * throw new PreToolUse.BlockingError('Tool not permitted in this context')
 */
export abstract class BlockingHookError extends HookError {
  readonly exitCode = 2
  readonly stdErrMessage?: string

  constructor(stdErrMessage?: string) {
    super('Blocking hook error')
    this.stdErrMessage = stdErrMessage
  }

  /**
   * Writes `stdErrMessage` to stderr if present.
   * Call this inside your `process(io)` implementation.
   */
  protected async writeStdErr(io: IO): Promise<void> {
    if (this.stdErrMessage) {
      io.err.write(this.stdErrMessage)
    }
  }
}
