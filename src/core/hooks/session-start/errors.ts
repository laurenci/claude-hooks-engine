import type { NonBlockingHookError } from '../hook-error.js'
import type { Response } from './response.js'

export const nonBlockingError = (options?: {
  reason?: string
  errMessage?: string
  response?: Omit<Response, 'continue'>
}): NonBlockingHookError => ({
  kind: 'non-blocking',
  exitCode: 0,
  outMessage: {
    continue: true,
    ...(options?.response ?? {}),
    ...(options?.reason !== undefined ? { systemMessage: options.reason } : {}),
  },
  errMessage: options?.errMessage,
})
