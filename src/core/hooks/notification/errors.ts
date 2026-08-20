import type { NonBlockingHookError } from '../hook-error.js'

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
