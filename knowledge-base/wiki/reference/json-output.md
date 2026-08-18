# JSON Output

Exit codes alone let you block or stay silent. JSON output gives finer-grained control: exit 0 and print a JSON object to stdout.

> **Pick one approach per hook.** If you mix exit codes with JSON, exit 2 keeps its blocking effect and Claude Code still reads the JSON fields. The one exception is noted under [Exit codes](./errors.md).

Your hook's stdout must contain **only** the JSON object. Shell profile text printed on startup can interfere with JSON parsing.

## Universal fields

These fields are accepted by every event but their effect varies by event type:

| Field | Default | Description |
| :-- | :-- | :-- |
| `continue` | `true` | If `false`, Claude stops processing entirely after the hook runs. Takes precedence over any event-specific decision fields |
| `stopReason` | none | Message shown to the user when `continue` is `false`. Not shown to Claude |
| `suppressOutput` | `false` | Accepted but has no effect; a successful hook's stdout is never shown in the transcript and is recorded only in the debug log |
| `systemMessage` | none | Warning message shown to the user |
| `terminalSequence` | none | Terminal escape sequence for Claude Code to emit on your behalf, such as a desktop notification, window title, or bell. Restricted to OSC `0/1/2/9/99/777` and BEL. Values outside this allowlist are ignored |

To stop Claude entirely:

```json
{ "continue": false, "stopReason": "Build failed, fix errors before continuing" }
```

For [`PreToolUse`](../hooks/pre-tool-use.md) and [`PostToolUse`](../hooks/post-tool-use.md) hooks, the stop applies even when the tool call fails or completes while Claude is still streaming a response.

## additionalContext

The `additionalContext` field passes a string from your hook into Claude's context window. Claude Code wraps the string in a system reminder and inserts it into the conversation at the point where the hook fired. Claude reads the reminder on the next model request, but it doesn't appear as a chat message in the interface.

Return `additionalContext` inside `hookSpecificOutput` alongside the event name:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "This file is generated. Edit src/schema.ts and run `bun generate` instead."
  }
}
```

Where the reminder appears depends on the event:

- `SessionStart`, `Setup`, and `SubagentStart`: at the start of the conversation, before the first prompt
- `UserPromptSubmit` and `UserPromptExpansion`: alongside the submitted prompt
- `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, and `PostToolBatch`: next to the tool result
- `Stop` and `SubagentStop`: at the end of the turn. The conversation continues so Claude can act on the feedback

When multiple hooks return `additionalContext` for the same event, Claude receives all values. If a value exceeds 10,000 characters, Claude Code writes the full text to a file in the session directory and passes Claude the file path with a short preview instead.

Use `additionalContext` to provide Claude with information about your environment or the operation that just ran:

- **Environment state**: current branch, deployment target, active feature flags
- **Conditional project rules**: which test command applies to the modified file, read-only directories in a worktree
- **External data**: open issues assigned to you, recent CI results, content from an internal service

## Decision control

Not every event supports blocking or controlling behavior through JSON. The events that do each use a different pattern. Use this table as a quick reference:

| Events | Decision pattern | Key fields |
| :-- | :-- | :-- |
| `UserPromptSubmit`, `UserPromptExpansion`, `PostToolUse`, `PostToolUseFailure`, `PostToolBatch`, `Stop`, `SubagentStop`, `ConfigChange`, `PreCompact` | Top-level `decision` | `decision: "block"`, `reason`. `Stop` and `SubagentStop` also accept `hookSpecificOutput.additionalContext` for non-error feedback that continues the conversation |
| `TeammateIdle`, `TaskCompleted` | Exit code or `continue: false` | Exit code 2 blocks; JSON `{"continue": false, "stopReason": "..."}` stops the teammate entirely, matching `Stop` hook behavior |
| `TaskCreated` | Exit code or top-level `decision` | Exit code 2 or `decision: "block"` cancels the task; `continue: false` is ignored |
| `PreToolUse` | `hookSpecificOutput` | `permissionDecision` (allow/deny/ask/defer), `permissionDecisionReason` |
| `PermissionRequest` | `hookSpecificOutput` | `decision.behavior` (allow/deny) |
| `PermissionDenied` | `hookSpecificOutput` | `retry: true` tells the model it may retry the denied tool call; ignored for no-verdict denials |
| `WorktreeCreate` | path return | Command hook prints path on stdout; HTTP hook returns `hookSpecificOutput.worktreePath`. Hook failure or missing path fails creation |
| `Elicitation` | `hookSpecificOutput` | `action` (accept/decline/cancel), `content` (form field values for accept) |
| `ElicitationResult` | `hookSpecificOutput` | `action` (accept/decline/cancel), `content` (form field values override) |
| `MessageDisplay` | `hookSpecificOutput` | `displayContent` replaces the displayed text on screen. Display-only: the transcript and what Claude sees keep the original |
| `SessionStart`, `Setup`, `SubagentStart` | Context only | `hookSpecificOutput.additionalContext` adds context for Claude. `SessionStart` also accepts `initialUserMessage`, `watchPaths`, `sessionTitle`, and `reloadSkills`. No blocking or decision control |
| `WorktreeRemove`, `Notification`, `SessionEnd`, `PostCompact`, `InstructionsLoaded`, `StopFailure`, `CwdChanged`, `DirectoryAdded`, `FileChanged` | None | Used for side effects like logging or cleanup |

## Rewriting content

Some events allow you to rewrite content rather than only allow or block:

- `PreToolUse`: `updatedInput` directly under `hookSpecificOutput` replaces a tool's arguments before it runs
- `PermissionRequest`: `updatedInput` inside the decision object
- `PostToolUse`: `updatedToolOutput` replaces the tool's result
- `UserPromptSubmit`: can only inject `additionalContext` alongside the prompt; cannot replace the prompt itself

For redaction or transformation use cases, intercept at `PreToolUse` for outbound tool inputs and `PostToolUse` for inbound tool results.

## References

- https://code.claude.com/docs/en/hooks#json-output
