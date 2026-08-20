export interface HookError {
  readonly kind: 'blocking' | 'non-blocking'
  readonly exitCode: number
  readonly outMessage?: string | Record<string, unknown>
  readonly errMessage?: string
}

export interface BlockingHookError extends HookError {
  readonly kind: 'blocking'
  readonly exitCode: 2
}

export interface NonBlockingHookError extends HookError {
  readonly kind: 'non-blocking'
  readonly exitCode: 0
}

export function isHookError(err: unknown): err is HookError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'kind' in err &&
    ((err as Record<string, unknown>)['kind'] === 'blocking' ||
      (err as Record<string, unknown>)['kind'] === 'non-blocking')
  )
}
