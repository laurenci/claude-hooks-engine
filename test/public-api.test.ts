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

test('public API exports isHookError', async () => {
  const api = await import('../index')
  expect(typeof api.isHookError).toBe('function')
})

test('public API does NOT export hook-specific namespaces', async () => {
  const api = await import('../index') as Record<string, unknown>
  expect(api['PreToolUse']).toBeUndefined()
  expect(api['Stop']).toBeUndefined()
  expect(api['PostToolUse']).toBeUndefined()
})
