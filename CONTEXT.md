# claude-hooks-engine — Domain Glossary

## HookError

A TypeScript interface (not a class) describing an object thrown from a hook
handler to signal that the handler cannot produce a valid response. `notify()`
detects a `HookError` via `isHookError()`, reads its fields to write stdout
and stderr, awaits all registered Cleanup Callbacks in order, then calls
`process.exit(exitCode)`. Unknown thrown values fall back to a safe-continue
response.

Fields: `kind`, `exitCode`, `outMessage?`, `errMessage?`.

## BlockingHookError

A `HookError` interface whose `kind` is `'blocking'` and `exitCode` is `2`.
Only meaningful on blockable hooks: `PreToolUse`, `UserPromptSubmit`, `Stop`,
`SubagentStop`, `PreCompact`. When detected on a non-blockable hook, the
runtime guard in `notify()` downgrades it to a non-blocking response.

The `outMessage` shape is hook-specific and enforced by each hook module's
`blockingError()` factory.

## NonBlockingHookError

A `HookError` interface whose `kind` is `'non-blocking'` and `exitCode` is
`0`. Allows Claude Code to continue. Optionally carries `outMessage` (written
to stdout) and `errMessage` (written to stderr, visible in debug logs only).

## Hook Module

A sub-path export of the library (e.g. `claude-hooks-engine/pre-tool-use`)
that groups everything related to one hook event: its `Payload` type, its
`Response` type, and its error factories (`blockingError()`,
`nonBlockingError()`). Consumers import a hook module with
`import * as PreToolUse from 'claude-hooks-engine/pre-tool-use'`.

## Blockable Hook

A hook event whose response Claude Code reads to decide whether to halt:
`PreToolUse`, `UserPromptSubmit`, `Stop`, `SubagentStop`, `PreCompact`.
Their hook modules expose both `blockingError()` and `nonBlockingError()`
factories.

## Non-blockable Hook

A hook event that Claude Code always continues past regardless of response:
`PostToolUse`, `Notification`, `SessionStart`. Their hook modules expose only
`nonBlockingError()`.

## isHookError

A type guard function (`isHookError(err): err is HookError`) that checks for
the `kind` discriminant field at runtime. Used by `notify()` to distinguish
`HookError` objects from unknown thrown values. The `kind` field also narrows
the type to `BlockingHookError` or `NonBlockingHookError` downstream.

## outMessage

The stdout payload field on a `HookError`. May be a string or a structured
object. `notify()` serializes it with `JSON.stringify` and writes it to
stdout. Each hook's `blockingError()` factory enforces the hook-specific
shape (e.g. `PreToolUse.blockingError()` produces
`{ permissionDecision: 'deny', permissionDecisionReason }` as `outMessage`).

## Cleanup Callback

An async function (`() => Promise<void>`) registered on an Observer via
`observer.onFinish()`. When `notify()` exits the process after a `HookError`,
it awaits each registered Cleanup Callback sequentially in registration order
before calling `process.exit()`. If a callback throws, the error is logged and
execution continues to the next callback — the exit is never blocked.

Typical uses: flushing async log sinks, closing open handles.

## Runtime Guard

The check inside `notify()`'s catch block that detects a `BlockingHookError`
thrown from a non-blockable hook. When triggered, it logs a warning and
writes `{ continue: true }` to stdout instead of the blocking response.
