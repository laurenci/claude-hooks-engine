import { test, expect } from 'bun:test'

test('public API exports createObserver', async () => {
  const api = await import('../index')
  expect(typeof api.createObserver).toBe('function')
})

test('public API exports createLogger', async () => {
  const api = await import('../index')
  expect(typeof api.createLogger).toBe('function')
})

test('public API exports extractArgs', async () => {
  const api = await import('../index')
  expect(typeof api.extractArgs).toBe('function')
})

test('public API exports standartIOProvider', async () => {
  const api = await import('../index')
  expect(typeof api.standartIOProvider).toBe('function')
})

test('public API exports HookEvent', async () => {
  const api = await import('../index')
  expect(api.HookEvent.PostToolUse).toBe('PostToolUse')
})

test('public API exports HookError base classes', async () => {
  const api = await import('../index')
  expect(typeof api.BlockingHookError).toBe('function')
  expect(typeof api.NonBlockingHookError).toBe('function')
})

test('public API exports hook error namespaces', async () => {
  const api = await import('../index')
  expect(typeof api.PreToolUse.BlockingError).toBe('function')
  expect(typeof api.PreToolUse.NonBlockingError).toBe('function')
  expect(typeof api.Stop.BlockingError).toBe('function')
  expect(typeof api.SessionStart.NonBlockingError).toBe('function')
  // Non-blockable hooks have no BlockingError
  expect((api.PostToolUse as any).BlockingError).toBeUndefined()
  expect((api.Notification as any).BlockingError).toBeUndefined()
  expect((api.SessionStart as any).BlockingError).toBeUndefined()
})
