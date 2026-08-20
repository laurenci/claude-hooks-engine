import type { BlockingHookError, NonBlockingHookError } from '../hook-error.js'

export const blockingError = (
  permissionDecisionReason: string,
  errMessage?: string,
): BlockingHookError => ({
  kind: 'blocking',
  exitCode: 2,
  outMessage: {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason,
    },
  },
  errMessage,
})

export const nonBlockingError = (options?: {
  reason?: string
  errMessage?: string
}): NonBlockingHookError => ({
  kind: 'non-blocking',
  exitCode: 0,
  outMessage: options?.reason !== undefined
    ? { continue: true, systemMessage: options.reason }
    : { continue: true },
  errMessage: options?.errMessage,
})
