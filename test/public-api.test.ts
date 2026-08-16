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
