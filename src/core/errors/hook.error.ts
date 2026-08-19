import type { IO } from '../../io.js'

/**
 * Abstract base for all hook errors thrown from handlers.
 *
 * `notify()` catches any `HookError`, calls `process(io)` so the error
 * writes its own response, then calls `process.exit(exitCode)`.
 *
 * Extend `BlockingHookError` or `NonBlockingHookError` — never extend
 * `HookError` directly.
 */
export abstract class HookError extends Error {
  abstract readonly exitCode: number
  abstract process(io: IO): Promise<void>
}
