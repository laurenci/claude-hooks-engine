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

**Agent ID / Agent Type**:
The identifier of a subagent instance and the name of its agent type. Present on a payload only when the hook fires inside a subagent (Agent Type also when Claude Code runs with `--agent`); their absence marks a main-thread call. Agent Type is the value subagent hook matchers filter on.
_Avoid_: Subagent ID, subagent name

**Cleanup Callback**:
An async function registered on an Observer to run after every `notify()` outcome, typically to flush log sinks or close handles.
_Avoid_: Finalizer, teardown hook

**Payload Normalizer**:
An optional transformer registered on an Observer per hook event, applied to the raw stdin JSON before the handler receives it. If it throws, the handler is not invoked.
_Avoid_: Preprocessor, payload middleware

**NormalizationError**:
An `Error` subclass thrown by the PostToolUse normalizer when a matching tool's string response is not a readable overflow message (`reason`: `'unrecognized-string'` or `'overflow-read-failed'`). Not a HookError; the Observer reports it as a non-blocking `systemMessage`.
_Avoid_: Overflow error, parse error
