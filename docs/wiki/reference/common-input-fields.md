# Common Input Fields

Every hook event receives these fields as JSON, in addition to any event-specific fields.

- **Command hooks**: payload arrives via stdin
- **HTTP hooks**: payload arrives as the POST request body

## Standard fields

| Field | Description |
| :-- | :-- |
| `session_id` | Identifier for the current Claude Code session |
| `prompt_id` | UUID identifying the user prompt being processed; correlates with OpenTelemetry telemetry events for the same prompt. Absent until the first user input. Requires Claude Code v2.1.196 or later |
| `transcript_path` | Path to the conversation history JSON file. Note: the file is written asynchronously and may lag the in-memory conversation state, so recent messages may not yet appear when a hook fires. For the most current assistant text, prefer reading `last_assistant_message` from `Stop` and `SubagentStop` events |
| `cwd` | Current working directory when the hook is invoked |
| `permission_mode` | Current permission mode: `"default"`, `"plan"`, `"acceptEdits"`, `"auto"`, `"dontAsk"`, or `"bypassPermissions"`. The Manual mode appears as `"default"`, not `"manual"`. Not all events include this field; check the JSON example for each hook event |
| `effort` | Object with a `level` field indicating the active effort setting for the turn: `"low"`, `"medium"`, `"high"`, `"xhigh"`, or `"max"`. If the requested model effort exceeds what the current model supports, this reflects the downgraded level actually used. Ultracode reports as `"xhigh"`. Also available to hook commands and the Bash tool as the `$CLAUDE_EFFORT` environment variable. Present only for events that fire within a tool-use context (e.g. `PreToolUse`, `PostToolUse`, `Stop`, `SubagentStop`) when the current model supports effort settings |
| `hook_event_name` | Name of the event that fired |

## Agent fields

Present only when running with `--agent` or inside a subagent:

| Field | Description |
| :-- | :-- |
| `agent_id` | Unique identifier for the subagent instance; distinguishes subagent hook calls from main-thread calls |
| `agent_type` | Agent name (e.g. `"Explore"` or `"security-reviewer"`); present with `--agent` mode or when the hook fires inside a subagent. For subagents, the subagent's type takes precedence over the session's `--agent` value |

## Notes

- Only `SessionStart` hooks may receive a `model` field, and it is not guaranteed to be present.
- There is no `$CLAUDE_MODEL` environment variable. A hook process inherits the parent environment and can read `$ANTHROPIC_MODEL` if set in your shell, but that value does not update when you switch models with `/model` during a session.

## References

- https://code.claude.com/docs/en/hooks#common-input-fields
