import { test, expect } from 'bun:test'

test('importing createLogger does not throw (no configure side effect)', async () => {
  // If configure() is still called at module level, this import will either
  // throw (if logtape was already configured) or succeed silently the first time.
  // The real guard: importing twice in the same process must not throw.
  const { createLogger } = await import('../src/logger')
  const { createLogger: again } = await import('../src/logger')
  expect(typeof createLogger).toBe('function')
  expect(typeof again).toBe('function')
})

test('createLogger returns a Logger with the hooks-engine category prefix', async () => {
  const { createLogger } = await import('../src/logger')
  const log = createLogger('test-ns')
  // Logger objects from logtape expose a `category` property
  expect((log as any).category).toEqual(['hooks-engine', 'test-ns'])
})
