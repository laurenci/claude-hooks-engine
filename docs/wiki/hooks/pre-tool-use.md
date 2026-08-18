# PreToolUse

> Fires after Claude creates tool parameters and before the tool executes; used to control whether the tool call proceeds and optionally modify its input.

## When it fires

PreToolUse fires once per tool call, after Claude has prepared the parameters but before execution begins. It matches on tool name: `Bash`, `PowerShell`, `Edit`, `Write`, `Read`, `Glob`, `Grep`, `Agent`, `WebFetch`, `WebSearch`, `AskUserQuestion`, `ExitPlanMode`, and any MCP tool names.

## Input fields

In addition to [common input fields](../reference/common-input-fields.md), PreToolUse hooks receive:

| Field | Description |
| :-- | :-- |
| `tool_name` | Name of the tool being called |
| `tool_input` | Parameters passed to the tool |
| `tool_use_id` | Identifier for this tool call |

Example payload for a `Write` tool call:

```json
{
  "hook_event_name": "PreToolUse",
  "session_id": "...",
  "tool_name": "Write",
  "tool_use_id": "...",
  "tool_input": {
    "file_path": "/path/to/file.ts",
    "content": "..."
  },
  ...
}
```

## Output / Decision control

PreToolUse returns its decision inside a `hookSpecificOutput` object (see Special behaviour below). The hook supports four outcomes plus input modification.

Return a JSON object with `hookSpecificOutput` containing:

| Field | Description |
| :-- | :-- |
| `permissionDecision` | One of `"allow"`, `"deny"`, `"ask"`, or `"defer"`. `"allow"` skips the permission prompt (with exceptions noted below). `"deny"` blocks the tool call. `"ask"` prompts the user to confirm. `"defer"` exits gracefully so the tool can be resumed later. Deny and ask rules are always evaluated regardless of hook response |
| `permissionDecisionReason` | Reason string shown to the user for `"allow"` and `"ask"` decisions, or to Claude for `"deny"`. Ignored for `"defer"` |
| `updatedInput` | Modifies the tool's input before execution. Replaces the entire input object, so include unchanged fields. Combine with `"allow"` to auto-approve modified input, or `"ask"` to show the user the modifications. Ignored for `"defer"` |
| `additionalContext` | String added to Claude's context alongside the tool result. See [JSON output](../reference/json-output.md) for details. Ignored when `permissionDecision` is `"defer"` |

A hook exiting with code 2 behaves the same as `"deny"` — Claude sees stderr as the denial reason.

## Special behaviour

**PreToolUse is the only hook that uses `hookSpecificOutput` for its primary decision control** rather than top-level fields. This enables richer control: four permission outcomes plus input modification in a single response.

**`AskUserQuestion` and `ExitPlanMode` exception:** These two tools always require `updatedInput` paired with `"allow"`. Returning `"allow"` without `updatedInput` for these tools will be treated as an error.

**Input modification:** The `updatedInput` field replaces the entire tool input object before execution. Include all unchanged fields alongside any modifications. This allows hooks to redact, transform, or augment parameters before Claude's tool runs.

## References

- https://code.claude.com/docs/en/hooks#pretooluse-input
- https://code.claude.com/docs/en/hooks#pretooluse-decision-control
