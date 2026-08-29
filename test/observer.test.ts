import { describe, test, expect, spyOn } from 'bun:test'
import type { Payload as SessionStartPayload, Response as SessionStartResponse } from "../src/core/hooks/session-start"
import type { SessionStartHandler } from '../src/core/handlers'
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

describe('Smoke', () => {
  test("Happy path", async () => {
    const payload: SessionStartPayload = {
      session_id: "abc123",
      transcript_path: "/path/to/transcript",
      hook_event_name: "SessionStart",
      source: "startup"
    };

    const expectedResponse: SessionStartResponse = {
      additionalContext: "some context",
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        sessionTitle: "title" // Corrected spelling from "tittle" to "title"
      }
    }; // Added missing semicolon

    const handler: SessionStartHandler = payload => expectedResponse;
    const { io, stdout: actualOutput } = makeMockIO(payload);
    await createObserver(() => io)
      .subscribe('SessionStart', "test", handler)
      .notify("SessionStart", "test");

    expect(actualOutput, "Observer should return JSON output as a single block").toBeArrayOfSize(1); // Changed "a one block" to "a single block"
    expect(actualOutput[0], "JSON output should match expected schema").toEqual(JSON.stringify(expectedResponse)); // Added missing semicolon
  });

  test("Verify that Observer processes unknown events in an appropriate way", async () => {
    const { io, stdout: actualOutput, stderr: actualError } = makeMockIO({});
    const expectedErrorMessage = "no handler found: SessionStart, unknown";

    await createObserver(() => io).notify("SessionStart", "unknown");

    expect(actualError).toBeArrayOfSize(1);
    expect(actualError[0]).toEqual(expectedErrorMessage);
    expect(actualOutput).toBeArrayOfSize(1);
    expect(actualOutput[0], "For unknown event name, an appropriate fail-safe JSON should be returned")
      .toEqual(JSON.stringify({ continue: true, systemMessage: expectedErrorMessage }));
  });

  test("Verify that Observer processes hooks errors in an appropriate way", async () => {
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
  });
});

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
  // Exit code 2 is preserved from the BlockingHookError even though the runtime guard downgraded the response to non-blocking.
  // This is intentional: the exit code signals the error to the OS, while the stdout { continue: true } controls Claude Code's behavior.
  expect(exitSpy).toHaveBeenCalledWith(2)
  exitSpy.mockRestore()
})

test('notify() writes continue and stack to stderr for unknown errors', async () => {
  const { io, stdout, stderr } = makeMockIO({ session_id: 's1', transcript_path: '/t' })
  const expectedErrorMessage = "unexpected crash";

  const observer = createObserver(() => io)
  observer.subscribe('Stop', 'test', async () => {
    throw new Error('unexpected crash')
  })

  await observer.notify('Stop', 'test')

  expect(JSON.parse(stdout[0]!)).toEqual({ continue: true, systemMessage: expectedErrorMessage })
  expect(stderr[0]!).toContain(expectedErrorMessage)
})

describe('onFinish', () => {
  test('callback is awaited before process.exit()', async () => {
    const { io } = makeMockIO({ session_id: 's1', transcript_path: '/t' })
    const order: string[] = []
    const exitSpy = spyOn(process, 'exit').mockImplementation(() => { throw new Error('EXIT') })

    const observer = createObserver(() => io)
    observer
      .onFinish(async () => { order.push('cleanup') })
      .subscribe('Stop', 'test', async () => { throw Stop.blockingError('reason') })

    try { await observer.notify('Stop', 'test') } catch {}

    expect(order).toEqual(['cleanup'])
    expect(exitSpy).toHaveBeenCalledWith(2)
    exitSpy.mockRestore()
  })

  test('multiple callbacks run sequentially in registration order', async () => {
    const { io } = makeMockIO({ session_id: 's1', transcript_path: '/t' })
    const order: string[] = []
    const exitSpy = spyOn(process, 'exit').mockImplementation(() => { throw new Error('EXIT') })

    const observer = createObserver(() => io)
    observer
      .onFinish(async () => { order.push('first') })
      .onFinish(async () => { order.push('second') })
      .subscribe('Stop', 'test', async () => { throw Stop.blockingError('reason') })

    try { await observer.notify('Stop', 'test') } catch {}

    expect(order).toEqual(['first', 'second'])
    exitSpy.mockRestore()
  })

  test('throwing callback is swallowed and subsequent callbacks still run', async () => {
    const { io } = makeMockIO({ session_id: 's1', transcript_path: '/t' })
    const order: string[] = []
    const exitSpy = spyOn(process, 'exit').mockImplementation(() => { throw new Error('EXIT') })

    const observer = createObserver(() => io)
    observer
      .onFinish(async () => { throw new Error('cleanup error') })
      .onFinish(async () => { order.push('second') })
      .subscribe('Stop', 'test', async () => { throw Stop.blockingError('reason') })

    try { await observer.notify('Stop', 'test') } catch {}

    expect(order).toEqual(['second'])
    expect(exitSpy).toHaveBeenCalledWith(2)
    exitSpy.mockRestore()
  })

  test('callbacks are NOT invoked on happy path', async () => {
    const payload = { session_id: 'abc', transcript_path: '/t', hook_event_name: 'SessionStart', source: 'startup' }
    const { io } = makeMockIO(payload)
    let cleanupCalled = false

    const observer = createObserver(() => io)
    observer
      .onFinish(async () => { cleanupCalled = true })
      .subscribe('SessionStart', 'test', async () => ({ additionalContext: '' }))

    await observer.notify('SessionStart', 'test')

    expect(cleanupCalled).toBe(false)
  })

  test('onFinish returns Observer for chaining', () => {
    const { io } = makeMockIO({})
    const observer = createObserver(() => io)
    expect(observer.onFinish(async () => {})).toBe(observer)
  })
})
