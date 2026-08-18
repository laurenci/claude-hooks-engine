# Stop

> Fires when Claude finishes a response. Can block the turn to continue processing, or provide guidance without blocking.

## When it fires

Fires once per turn after the main Claude Code agent has finished responding. Does not fire on user interrupts or API errors (which instead trigger `StopFailure`).

## Input fields

In addition to the [common input fields](../reference/common-input-fields.md), Stop hooks receive:

| Field | Description |
| :-- | :-- |
| `stop_hook_active` | `true` when Claude is continuing as a result of a Stop hook. Check this to avoid infinite block loops |
| `last_assistant_message` | Text content of Claude's final response for this turn |
| `background_tasks` | Array of in-flight background tasks (see table below) |
| `session_crons` | Array of session-scoped scheduled wakeups (see table below) |

### background_tasks fields

| Field | Description |
| :-- | :-- |
| `id` | Task identifier |
| `type` | Task type: `shell`, `subagent`, `monitor`, `workflow`, `teammate`, `cloud session`, or `MCP task` |
| `status` | Current task status |
| `description` | Free-text description, capped at 1000 characters with `… [+N chars]` marker when clipped |
| `command` | Shell command line (shell tasks only), capped at 1000 characters |
| `agent_type` | Subagent type name (subagent tasks only) |
| `server` | MCP server name (monitor and MCP task tasks only) |
| `tool` | MCP tool name (monitor and MCP task tasks only) |
| `name` | Workflow name (workflow tasks only) |

### session_crons fields

| Field | Description |
| :-- | :-- |
| `id` | Cron task identifier |
| `schedule` | Cron expression, for example `0 9 * * 1-5` |
| `recurring` | `false` for one-shot wakeups, `true` for tasks that re-fire on every match |
| `prompt` | Prompt submitted when the cron fires, capped at 1000 characters with `… [+N chars]` marker when clipped |

### Example input

```json
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "Stop",
  "stop_hook_active": false,
  "last_assistant_message": "I've completed the refactoring. Here's a summary...",
  "background_tasks": [
    {
      "id": "task-001",
      "type": "shell",
      "status": "running",
      "description": "tail logs",
      "command": "tail -f /var/log/syslog"
    }
  ],
  "session_crons": [
    {
      "id": "cron-001",
      "schedule": "0 9 * * 1-5",
      "recurring": true,
      "prompt": "check the build"
    }
  ]
}
```

## Output / Decision control

In addition to the [common output fields](../reference/json-output.md), Stop hooks can return:

| Field | Description |
| :-- | :-- |
| `decision` | `"block"` prevents Claude from stopping. Requires `reason` |
| `reason` | Required when `decision` is `"block"`. Explains why Claude should continue |
| `hookSpecificOutput.additionalContext` | Non-error guidance for Claude. Conversation continues without being flagged as a hook error |

### Block the turn

```json
{
  "decision": "block",
  "reason": "The test suite has not been run yet"
}
```

### Provide guidance without blocking

```json
{
  "hookSpecificOutput": {
    "hookEventName": "Stop",
    "additionalContext": "Please run the test suite before finishing"
  }
}
```

### Exit code 2 shows stderr

Exiting with code 2 shows stderr to Claude as the explanation for why it should continue — functionally equivalent to returning `decision: "block"` with the `reason` set to stderr.

## Special behaviour

### Infinite loop guard

Claude Code enforces an 8-block limit per turn. After a Stop hook returns `decision: "block"` eight consecutive times, Claude Code overrides the hook and ends the turn anyway. This prevents infinite loops.

**Always check `stop_hook_active`** before blocking. If it is `true`, Claude is already continuing as a result of a Stop hook and you are approaching the block limit. Use `additionalContext` or avoid blocking to prevent consuming a block slot.

## References

- [Common input fields](../reference/common-input-fields.md)
- [JSON output fields](../reference/json-output.md)
