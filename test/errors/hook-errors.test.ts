import { test, expect } from 'bun:test'
import { BlockingHookError } from '../../src/core/errors/blocking.error'
import { NonBlockingHookError } from '../../src/core/errors/non-blocking.error'
import { PreToolUse } from '../../src/core/errors/hooks/pre-tool-use.error'
import { Stop } from '../../src/core/errors/hooks/stop.error'
import { SubagentStop } from '../../src/core/errors/hooks/subagent-stop.error'
import { UserPromptSubmit } from '../../src/core/errors/hooks/user-prompt-submit.error'
import { PreCompact } from '../../src/core/errors/hooks/pre-compact.error'
import { PostToolUse } from '../../src/core/errors/hooks/post-tool-use.error'
import { Notification } from '../../src/core/errors/hooks/notification.error'
import { SessionStart } from '../../src/core/errors/hooks/session-start.error'
import type { IO } from '../../src/io'

function mockIO() {
  const stdout: string[] = []
  const stderr: string[] = []
  return {
    io: {
      in: Bun.stdin,
      out: { write: (s: string) => { stdout.push(s); return Promise.resolve(stdout.length) } },
      err: { write: (s: string) => { stderr.push(s); return Promise.resolve(stderr.length) } },
    } as unknown as IO,
    stdout,
    stderr,
  }
}

// Concrete test subclasses (not exported, only for this test file)
class ConcreteBlocking extends BlockingHookError {
  async process(io: IO): Promise<void> {
    io.out.write(JSON.stringify({ decision: 'block', reason: 'test' }))
    await this.writeStdErr(io)
  }
}

class ConcreteNonBlocking extends NonBlockingHookError {
  async process(io: IO): Promise<void> {
    const response: Record<string, unknown> = { continue: true }
    if (this.reason) response.systemMessage = this.reason
    io.out.write(JSON.stringify(response))
    if (this.stdErrMessage) io.err.write(this.stdErrMessage)
  }
}

test('BlockingHookError has exitCode 2', () => {
  const err = new ConcreteBlocking()
  expect(err.exitCode).toBe(2)
})

test('BlockingHookError writeStdErr writes stdErrMessage when present', async () => {
  const { io, stderr } = mockIO()
  const err = new ConcreteBlocking('debug info')
  await err.process(io)
  expect(stderr).toEqual(['debug info'])
})

test('BlockingHookError writeStdErr does nothing when stdErrMessage absent', async () => {
  const { io, stderr } = mockIO()
  const err = new ConcreteBlocking()
  await err.process(io)
  expect(stderr).toEqual([])
})

test('NonBlockingHookError has exitCode 0', () => {
  const err = new ConcreteNonBlocking()
  expect(err.exitCode).toBe(0)
})

test('NonBlockingHookError process writes systemMessage when reason present', async () => {
  const { io, stdout } = mockIO()
  const err = new ConcreteNonBlocking({ reason: 'something went wrong' })
  await err.process(io)
  expect(JSON.parse(stdout[0]!)).toEqual({ continue: true, systemMessage: 'something went wrong' })
})

test('NonBlockingHookError process writes bare continue when reason absent', async () => {
  const { io, stdout } = mockIO()
  const err = new ConcreteNonBlocking()
  await err.process(io)
  expect(JSON.parse(stdout[0]!)).toEqual({ continue: true })
})

test('NonBlockingHookError can carry both reason and stdErrMessage', async () => {
  const { io, stdout, stderr } = mockIO()
  const err = new ConcreteNonBlocking({ reason: 'user message', stdErrMessage: 'debug' })
  await err.process(io)
  expect(JSON.parse(stdout[0]!).systemMessage).toBe('user message')
  expect(stderr).toEqual(['debug'])
})

// --- PreToolUse ---
test('PreToolUse.BlockingError writes deny decision with permissionDecisionReason', async () => {
  const { io, stdout, stderr } = mockIO()
  const err = new PreToolUse.BlockingError('not allowed', 'debug')
  await err.process(io)
  const body = JSON.parse(stdout[0]!)
  expect(body.hookSpecificOutput.hookEventName).toBe('PreToolUse')
  expect(body.hookSpecificOutput.permissionDecision).toBe('deny')
  expect(body.hookSpecificOutput.permissionDecisionReason).toBe('not allowed')
  expect(stderr).toEqual(['debug'])
})

test('PreToolUse.NonBlockingError writes continue with systemMessage', async () => {
  const { io, stdout } = mockIO()
  const err = new PreToolUse.NonBlockingError({ reason: 'skipped' })
  await err.process(io)
  expect(JSON.parse(stdout[0]!)).toEqual({ continue: true, systemMessage: 'skipped' })
})

// --- Stop ---
test('Stop.BlockingError writes decision block with reason', async () => {
  const { io, stdout } = mockIO()
  const err = new Stop.BlockingError('must re-run checks')
  await err.process(io)
  expect(JSON.parse(stdout[0]!)).toEqual({ decision: 'block', reason: 'must re-run checks' })
})

test('Stop.NonBlockingError writes bare continue when no reason', async () => {
  const { io, stdout } = mockIO()
  const err = new Stop.NonBlockingError()
  await err.process(io)
  expect(JSON.parse(stdout[0]!)).toEqual({ continue: true })
})

// --- SubagentStop ---
test('SubagentStop.BlockingError writes decision block with reason', async () => {
  const { io, stdout } = mockIO()
  const err = new SubagentStop.BlockingError('subagent loop guard')
  await err.process(io)
  expect(JSON.parse(stdout[0]!)).toEqual({ decision: 'block', reason: 'subagent loop guard' })
})

// --- UserPromptSubmit ---
test('UserPromptSubmit.BlockingError writes decision block with reason', async () => {
  const { io, stdout } = mockIO()
  const err = new UserPromptSubmit.BlockingError('prompt rejected by policy')
  await err.process(io)
  expect(JSON.parse(stdout[0]!)).toEqual({ decision: 'block', reason: 'prompt rejected by policy' })
})

// --- PreCompact ---
test('PreCompact.BlockingError writes decision block with reason', async () => {
  const { io, stdout } = mockIO()
  const err = new PreCompact.BlockingError('compaction not allowed now')
  await err.process(io)
  expect(JSON.parse(stdout[0]!)).toEqual({ decision: 'block', reason: 'compaction not allowed now' })
})

// --- PostToolUse (non-blockable) ---
test('PostToolUse.NonBlockingError writes bare continue when no options', async () => {
  const { io, stdout } = mockIO()
  const err = new PostToolUse.NonBlockingError()
  await err.process(io)
  expect(JSON.parse(stdout[0]!)).toEqual({ continue: true })
})

test('PostToolUse.NonBlockingError merges partial response onto stdout', async () => {
  const { io, stdout } = mockIO()
  const err = new PostToolUse.NonBlockingError({
    reason: 'hook failed softly',
    response: {
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: 'extra context',
      },
    },
  })
  await err.process(io)
  const body = JSON.parse(stdout[0]!)
  expect(body.continue).toBe(true)
  expect(body.systemMessage).toBe('hook failed softly')
  expect(body.hookSpecificOutput.additionalContext).toBe('extra context')
})

// --- Notification ---
test('Notification.NonBlockingError writes continue with systemMessage', async () => {
  const { io, stdout } = mockIO()
  const err = new Notification.NonBlockingError({ reason: 'notify handler failed' })
  await err.process(io)
  expect(JSON.parse(stdout[0]!)).toEqual({ continue: true, systemMessage: 'notify handler failed' })
})

// --- SessionStart ---
test('SessionStart.NonBlockingError writes bare continue when no options', async () => {
  const { io, stdout } = mockIO()
  const err = new SessionStart.NonBlockingError()
  await err.process(io)
  expect(JSON.parse(stdout[0]!)).toEqual({ continue: true })
})

test('SessionStart.NonBlockingError merges partial response with additionalContext', async () => {
  const { io, stdout } = mockIO()
  const err = new SessionStart.NonBlockingError({
    response: {
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: 'partial context from error path',
      },
    },
  })
  await err.process(io)
  const body = JSON.parse(stdout[0]!)
  expect(body.continue).toBe(true)
  expect(body.hookSpecificOutput.additionalContext).toBe('partial context from error path')
})
