# claude-hooks-engine — Domain Glossary

## HookError

An exception thrown from a hook handler to signal that the handler cannot
produce a valid response. `notify()` catches `HookError`, calls
`error.process(io)` to write the IO response, then calls
`process.exit(error.exitCode)`. Unknown errors (non-`HookError`) fall back
to a safe-continue response.

## BlockingHookError

A `HookError` subclass that stops Claude Code from proceeding. Exit code 2.
Only meaningful on blockable hooks: `PreToolUse`, `UserPromptSubmit`, `Stop`,
`SubagentStop`, `PreCompact`. When thrown from a non-blockable hook, the
runtime guard in `notify()` downgrades it to a non-blocking response.

## NonBlockingHookError

A `HookError` subclass that allows Claude Code to continue. Exit code 0.
Optionally surfaces a `reason` string to the Claude session via `systemMessage`,
and optionally writes a `stdErrMessage` to stderr (Claude Code debug logs).

## Blockable Hook

A hook event whose response Claude Code reads to decide whether to halt:
`PreToolUse`, `UserPromptSubmit`, `Stop`, `SubagentStop`, `PreCompact`.
These hooks expose both `BlockingError` and `NonBlockingError` in their namespace.

## Non-blockable Hook

A hook event that Claude Code always continues past regardless of response:
`PostToolUse`, `Notification`, `SessionStart`. These hooks expose only
`NonBlockingError` in their namespace.

## Hook Namespace

A TypeScript `namespace` (e.g. `PreToolUse`, `Stop`, `SessionStart`) that
groups the error classes for a specific hook event. Concrete error classes
live inside namespaces rather than the global scope to keep names unambiguous
and co-locate blocking/non-blocking variants.

## process(io)

The abstract method on `HookError` that owns all IO side effects: writing
the JSON response to stdout and optionally writing debug text to stderr.
Keeping exit-code logic out of `process(io)` ensures the method is testable
without mocking `process.exit`.

## Runtime Guard

The check inside `notify()`'s catch block that detects a `BlockingHookError`
thrown from a non-blockable hook. When triggered, it logs a warning and
writes `{ continue: true }` to stdout instead of the blocking response.
