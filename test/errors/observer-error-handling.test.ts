import { test, expect, spyOn } from 'bun:test'
import { createObserver } from '../../src/observer'
import { Stop } from '../../src/core/errors/hooks/stop.error'
import type { IO } from '../../src/io'

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

test('notify() calls process(io) when handler throws HookError', async () => {
  const { io, stdout } = makeMockIO({ session_id: 's1', transcript_path: '/t' })
  const exitSpy = spyOn(process, 'exit').mockImplementation(() => { throw new Error('EXIT') })

  const observer = createObserver(() => io)
  observer.subscribe('Stop', 'test', async () => {
    throw new Stop.BlockingError('blocking reason')
  })

  try {
    await observer.notify('Stop', 'test')
  } catch (e: any) {
    expect(e.message).toBe('EXIT')
  }

  expect(JSON.parse(stdout[0]!)).toEqual({ decision: 'block', reason: 'blocking reason' })
  expect(exitSpy).toHaveBeenCalledWith(2)
  exitSpy.mockRestore()
})

test('notify() runtime guard: BlockingHookError on non-blockable PostToolUse downgrades to continue', async () => {
  const { io, stdout } = makeMockIO({ session_id: 's1', transcript_path: '/t', tool_name: 'Read', tool_input: {}, tool_response: 'ok' })
  const exitSpy = spyOn(process, 'exit').mockImplementation(() => { throw new Error('EXIT') })

  // Concrete blocking error for a blockable hook, thrown from a PostToolUse handler
  const observer = createObserver(() => io)
  observer.subscribe('PostToolUse', 'test', async () => {
    throw new Stop.BlockingError('should be downgraded')
  })

  try {
    await observer.notify('PostToolUse', 'test')
  } catch (e: any) {
    expect(e.message).toBe('EXIT')
  }

  expect(JSON.parse(stdout[0]!)).toEqual({ continue: true })
  expect(exitSpy).toHaveBeenCalledWith(2)  // exitCode is still 2 (from the error class), but response is downgraded
  exitSpy.mockRestore()
})

test('notify() writes action:continue and stack to stderr for unknown errors', async () => {
  const { io, stdout, stderr } = makeMockIO({ session_id: 's1', transcript_path: '/t' })
  const exitSpy = spyOn(process, 'exit').mockImplementation(() => undefined as never)

  const observer = createObserver(() => io)
  observer.subscribe('Stop', 'test', async () => {
    throw new Error('unexpected crash')
  })

  await observer.notify('Stop', 'test')

  expect(JSON.parse(stdout[0]!)).toEqual({ continue: true })
  expect(stderr[0]!).toContain('unexpected crash')
  exitSpy.mockRestore()
})
