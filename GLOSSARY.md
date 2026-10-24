# claude-hooks-engine

A type-safe observer framework for writing Claude Code hook scripts. A consumer subscribes handlers to hook events and the library speaks the stdin/stdout protocol Claude Code expects.

## Language

**Hook Module**:
The per-hook sub-path export that groups one hook event's payload type, response type, and error factories.
_Avoid_: Namespace, hook package

**Blockable Hook**:
A hook event whose response Claude Code reads to decide whether to halt: `PreToolUse`, `UserPromptSubmit`, `Stop`, `SubagentStop`, `PreCompact`.
_Avoid_: Blocking hook, gating hook

**Non-blockable Hook**:
A hook event that Claude Code always continues past regardless of response: `PostToolUse`, `Notification`, `SessionStart`.
_Avoid_: Passive hook

**HookError**:
A plain data object thrown from a handler to signal it cannot produce a valid response. Is either blocking or non-blocking.
_Avoid_: Hook exception, failure

**Blocking HookError**:
A HookError that tells Claude Code to halt. Only meaningful on Blockable Hooks; on a Non-blockable Hook it is downgraded to non-blocking.
_Avoid_: Fatal error

**Non-blocking HookError**:
A HookError that lets Claude Code continue, optionally carrying a message for stdout or stderr.
_Avoid_: Soft error, warning

**Cleanup Callback**:
An async function registered on an Observer to run after every `notify()` outcome, typically to flush log sinks or close handles.
_Avoid_: Finalizer, teardown hook
