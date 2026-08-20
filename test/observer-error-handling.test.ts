import { test, expect, spyOn } from 'bun:test'
import { createObserver } from '../src/observer'
import * as Stop from '../src/core/hooks/stop/index'
import type { IO } from '../src/io'

function makeMockIO(payload: unknown) {
  const stdout: string[] = []
  const stderr: string[] = []
  return {
    io: {
      in: { json: async () => payload },
      out: { write: (s: string) => { stdout.push(s); return Promise.resolve(stdout.length) } },
      err: { write: (s: string) => { stderr.push(s); return Promise.resolve(stderr.length) } },
    } as unknown as IO,
    stdout,
    stderr,
  }
}

test('notify() writes outMessage when handler throws HookError', async () => {
  const { io, stdout } = makeMockIO({ session_id: 's1', transcript_path: '/t' })
  const exitSpy = spyOn(process, 'exit').mockImplementation(() => { throw new Error('EXIT') })

  const observer = createObserver(() => io)
  observer.subscribe('Stop', 'test', async () => {
    throw Stop.blockingError('blocking reason')
  })

  try {
    await observer.notify('Stop', 'test')
  } catch (e: unknown) {
    expect((e as Error).message).toBe('EXIT')
  }

  expect(JSON.parse(stdout[0]!)).toEqual({ decision: 'block', reason: 'blocking reason' })
  expect(exitSpy).toHaveBeenCalledWith(2)
  exitSpy.mockRestore()
})

test('notify() runtime guard: blocking kind on PostToolUse downgrades to continue', async () => {
  const { io, stdout } = makeMockIO({ session_id: 's1', transcript_path: '/t', tool_name: 'Read', tool_input: {}, tool_response: 'ok' })
  const exitSpy = spyOn(process, 'exit').mockImplementation(() => { throw new Error('EXIT') })

  const observer = createObserver(() => io)
  observer.subscribe('PostToolUse', 'test', async () => {
    // Deliberately throw a blocking error from a non-blockable hook
    throw Stop.blockingError('should be downgraded')
  })

  try {
    await observer.notify('PostToolUse', 'test')
  } catch (e: unknown) {
    expect((e as Error).message).toBe('EXIT')
  }

  expect(JSON.parse(stdout[0]!)).toEqual({ continue: true })
  expect(exitSpy).toHaveBeenCalledWith(2)
  exitSpy.mockRestore()
})

test('notify() writes continue and stack to stderr for unknown errors', async () => {
  const { io, stdout, stderr } = makeMockIO({ session_id: 's1', transcript_path: '/t' })

  const observer = createObserver(() => io)
  observer.subscribe('Stop', 'test', async () => {
    throw new Error('unexpected crash')
  })

  await observer.notify('Stop', 'test')

  expect(JSON.parse(stdout[0]!)).toEqual({ continue: true })
  expect(stderr[0]!).toContain('unexpected crash')
})
