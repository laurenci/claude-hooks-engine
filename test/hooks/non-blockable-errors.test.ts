import { test, expect } from 'bun:test'
import * as PostToolUse from '../../src/core/hooks/post-tool-use/index.js'
import * as Notification from '../../src/core/hooks/notification/index.js'
import * as SessionStart from '../../src/core/hooks/session-start/index.js'

// PostToolUse
test('PostToolUse.nonBlockingError creates bare continue when no options', () => {
  const err = PostToolUse.nonBlockingError()
  expect(err.kind).toBe('non-blocking')
  expect(err.exitCode).toBe(0)
  expect(err.outMessage).toEqual({ continue: true })
})

test('PostToolUse.nonBlockingError creates continue with systemMessage when reason given', () => {
  const err = PostToolUse.nonBlockingError({ reason: 'hook failed softly' })
  expect(err.outMessage).toEqual({ continue: true, systemMessage: 'hook failed softly' })
})

test('PostToolUse.nonBlockingError merges partial response onto outMessage', () => {
  const err = PostToolUse.nonBlockingError({
    reason: 'hook failed softly',
    response: {
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: 'extra context',
      },
    },
  })
  expect(err.outMessage).toEqual({
    continue: true,
    systemMessage: 'hook failed softly',
    hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: 'extra context' },
  })
})

test('PostToolUse.nonBlockingError carries errMessage', () => {
  const err = PostToolUse.nonBlockingError({ errMessage: 'debug' })
  expect(err.errMessage).toBe('debug')
})

// Notification
test('Notification.nonBlockingError creates continue with systemMessage', () => {
  const err = Notification.nonBlockingError({ reason: 'notify handler failed' })
  expect(err.kind).toBe('non-blocking')
  expect(err.outMessage).toEqual({ continue: true, systemMessage: 'notify handler failed' })
})

test('Notification.nonBlockingError creates bare continue when no reason', () => {
  const err = Notification.nonBlockingError()
  expect(err.outMessage).toEqual({ continue: true })
})

// SessionStart
test('SessionStart.nonBlockingError creates bare continue when no options', () => {
  const err = SessionStart.nonBlockingError()
  expect(err.kind).toBe('non-blocking')
  expect(err.outMessage).toEqual({ continue: true })
})

test('SessionStart.nonBlockingError merges partial response onto outMessage', () => {
  const err = SessionStart.nonBlockingError({
    response: {
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: 'defaults applied',
      },
    },
  })
  expect(err.outMessage).toEqual({
    continue: true,
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: 'defaults applied' },
  })
})

test('SessionStart.nonBlockingError with reason and response merges both', () => {
  const err = SessionStart.nonBlockingError({
    reason: 'Config load failed',
    response: {
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: 'defaults applied',
      },
    },
  })
  expect(err.outMessage).toEqual({
    continue: true,
    systemMessage: 'Config load failed',
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: 'defaults applied' },
  })
})
