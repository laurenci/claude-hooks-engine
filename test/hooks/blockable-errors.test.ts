import { test, expect } from 'bun:test'
import * as PreToolUse from '../../src/core/hooks/pre-tool-use/index.js'
import * as Stop from '../../src/core/hooks/stop/index.js'
import * as SubagentStop from '../../src/core/hooks/subagent-stop/index.js'
import * as UserPromptSubmit from '../../src/core/hooks/user-prompt-submit/index.js'
import * as PreCompact from '../../src/core/hooks/pre-compact/index.js'

// PreToolUse
test('PreToolUse.blockingError creates correct object', () => {
  const err = PreToolUse.blockingError('not allowed')
  expect(err.kind).toBe('blocking')
  expect(err.exitCode).toBe(2)
  expect(err.outMessage).toEqual({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: 'not allowed',
    },
  })
  expect(err.errMessage).toBeUndefined()
})

test('PreToolUse.blockingError carries errMessage', () => {
  const err = PreToolUse.blockingError('not allowed', 'debug info')
  expect(err.errMessage).toBe('debug info')
})

test('PreToolUse.nonBlockingError creates continue with systemMessage when reason given', () => {
  const err = PreToolUse.nonBlockingError({ reason: 'skipped' })
  expect(err.kind).toBe('non-blocking')
  expect(err.exitCode).toBe(0)
  expect(err.outMessage).toEqual({ continue: true, systemMessage: 'skipped' })
})

test('PreToolUse.nonBlockingError creates bare continue when no reason', () => {
  const err = PreToolUse.nonBlockingError()
  expect(err.outMessage).toEqual({ continue: true })
})

// Stop
test('Stop.blockingError creates correct object', () => {
  const err = Stop.blockingError('must re-run checks')
  expect(err.kind).toBe('blocking')
  expect(err.exitCode).toBe(2)
  expect(err.outMessage).toEqual({ decision: 'block', reason: 'must re-run checks' })
})

test('Stop.blockingError carries errMessage', () => {
  const err = Stop.blockingError('reason', 'debug')
  expect(err.errMessage).toBe('debug')
})

test('Stop.nonBlockingError creates correct object with reason', () => {
  const err = Stop.nonBlockingError({ reason: 'soft error' })
  expect(err.outMessage).toEqual({ continue: true, systemMessage: 'soft error' })
})

test('Stop.nonBlockingError creates bare continue when no options', () => {
  const err = Stop.nonBlockingError()
  expect(err.outMessage).toEqual({ continue: true })
})

// SubagentStop
test('SubagentStop.blockingError creates correct object', () => {
  const err = SubagentStop.blockingError('loop guard')
  expect(err.kind).toBe('blocking')
  expect(err.outMessage).toEqual({ decision: 'block', reason: 'loop guard' })
})

test('SubagentStop.nonBlockingError creates correct object', () => {
  const err = SubagentStop.nonBlockingError({ reason: 'metric failed' })
  expect(err.outMessage).toEqual({ continue: true, systemMessage: 'metric failed' })
})

// UserPromptSubmit
test('UserPromptSubmit.blockingError creates correct object', () => {
  const err = UserPromptSubmit.blockingError('prompt rejected by policy')
  expect(err.outMessage).toEqual({ decision: 'block', reason: 'prompt rejected by policy' })
})

test('UserPromptSubmit.nonBlockingError creates correct object', () => {
  const err = UserPromptSubmit.nonBlockingError({ reason: 'enrichment failed' })
  expect(err.outMessage).toEqual({ continue: true, systemMessage: 'enrichment failed' })
})

// PreCompact
test('PreCompact.blockingError creates correct object', () => {
  const err = PreCompact.blockingError('compaction blocked')
  expect(err.outMessage).toEqual({ decision: 'block', reason: 'compaction blocked' })
})

test('PreCompact.nonBlockingError creates correct object', () => {
  const err = PreCompact.nonBlockingError()
  expect(err.outMessage).toEqual({ continue: true })
})
