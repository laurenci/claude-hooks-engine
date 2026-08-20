import { test, expect } from 'bun:test'
import { isHookError } from '../../src/core/hooks/hook-error'

test('isHookError returns true for object with kind: blocking', () => {
  expect(isHookError({ kind: 'blocking', exitCode: 2 })).toBe(true)
})

test('isHookError returns true for object with kind: non-blocking', () => {
  expect(isHookError({ kind: 'non-blocking', exitCode: 0 })).toBe(true)
})

test('isHookError returns false for Error instance without kind', () => {
  expect(isHookError(new Error('oops'))).toBe(false)
})

test('isHookError returns false for null', () => {
  expect(isHookError(null)).toBe(false)
})

test('isHookError returns false for plain object without kind', () => {
  expect(isHookError({ exitCode: 2 })).toBe(false)
})

test('isHookError returns false for string', () => {
  expect(isHookError('error')).toBe(false)
})
