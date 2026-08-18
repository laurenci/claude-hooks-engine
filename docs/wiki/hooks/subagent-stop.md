# SubagentStop

> Fires when a Claude Code subagent finishes responding. Matches on agent type to filter which subagents trigger the hook.

## When it fires

Fires once per subagent response after a Claude Code subagent has completed its output. Does not fire on subagent failures or interrupts. Matching is based on `agent_type` — the same values used for `SubagentStart` hooks.

## Input fields

In addition to the [common input fields](../reference/common-input-fields.md), SubagentStop hooks receive:

| Field | Description |
| :-- | :-- |
| `stop_hook_active` | `true` when Claude is continuing as a result of a SubagentStop hook. Check this to avoid infinite block loops |
| `agent_id` | Unique identifier for the subagent instance |
| `agent_type` | Agent type name — the value used for matcher filtering |
| `agent_transcript_path` | Path to the subagent's own transcript (in a nested `subagents/` folder), distinct from `transcript_path` |
| `last_assistant_message` | Text content of the subagent's final response |
| `background_tasks` | Array of in-flight background tasks. See [Stop input](./stop.md#input-fields) for field details |
| `session_crons` | Array of session-scoped scheduled wakeups. See [Stop input](./stop.md#input-fields) for field details |

### Example input

```json
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../abc123.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "SubagentStop",
  "stop_hook_active": false,
  "agent_id": "def456",
  "agent_type": "Explore",
  "agent_transcript_path": "~/.claude/projects/.../abc123/subagents/agent-def456.jsonl",
  "last_assistant_message": "Analysis complete. Found 3 potential issues...",
  "background_tasks": [],
  "session_crons": []
}
```

## Output / Decision control

In addition to the [common output fields](../reference/json-output.md), SubagentStop hooks can return:

| Field | Description |
| :-- | :-- |
| `decision` | `"block"` prevents the subagent from stopping. Requires `reason` |
| `reason` | Required when `decision` is `"block"`. Explains why the subagent should continue |
| `hookSpecificOutput.additionalContext` | Non-error guidance for the subagent. Conversation continues without being flagged as a hook error |

### Block the subagent

```json
{
  "decision": "block",
  "reason": "Verify that all findings are documented before concluding"
}
```

### Provide guidance without blocking

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SubagentStop",
    "additionalContext": "Consider cross-referencing findings with the architecture docs"
  }
}
```

### Exit code 2 shows stderr

Exiting with code 2 shows stderr to the subagent as the explanation for why it should continue — functionally equivalent to returning `decision: "block"` with the `reason` set to stderr.

## Special behaviour

### Two transcripts

SubagentStop hooks receive two distinct transcript paths:

- **`transcript_path`** — the main Claude Code session's transcript, containing the full conversation including all tool calls and responses
- **`agent_transcript_path`** — the subagent's own transcript, stored in a nested `subagents/` folder and containing only messages within that subagent's context

Use `last_assistant_message` to access the subagent's final response without parsing either transcript file. This is the recommended approach for hooks that need to inspect the subagent's output.

### Infinite loop guard

SubagentStop follows the same blocking pattern as Stop hooks. An 8-block limit per subagent response prevents infinite loops. **Always check `stop_hook_active`** before blocking — if it is `true`, the subagent is already continuing and you are approaching the block limit. Use `additionalContext` or avoid blocking to prevent consuming a block slot.

## References

- [Common input fields](../reference/common-input-fields.md)
- [JSON output fields](../reference/json-output.md)
- [Stop hook](./stop.md)
- https://code.claude.com/docs/en/hooks#subagentstop
