# PostToolUse

> Runs immediately after a tool completes successfully. Matches on tool name. Cannot block the tool (it already ran), but can provide feedback to Claude or modify the output.

## When it fires

Fires after a tool has executed successfully. Matches on tool name (same values as `PreToolUse`). The tool has already completed and cannot be blocked.

## Input fields

In addition to the [common input fields](../reference/common-input-fields.md), PostToolUse hooks receive:

| Field | Description |
| :-- | :-- |
| `tool_name` | Name of the tool that ran |
| `tool_input` | Arguments sent to the tool. File-tool paths are always absolute with platform-native separators (backslashes on Windows) |
| `tool_response` | Result returned by the tool. Schema depends on the specific tool |
| `tool_use_id` | Identifier for this tool call |
| `duration_ms` | Optional. Tool execution time in milliseconds. Excludes time in permission prompts and `PreToolUse` hooks |

## Output / Decision control

In addition to the [common output fields](../reference/json-output.md), PostToolUse hooks can return:

| Field | Description |
| :-- | :-- |
| `decision` | `"block"` adds the reason next to the tool result. Claude still sees the original output; use `updatedToolOutput` to replace it |
| `reason` | Explanation shown to Claude when `decision` is `"block"` |
| `additionalContext` | String added to Claude's context alongside the tool result |
| `updatedToolOutput` | Replaces the tool's output before sending to Claude. Must match the tool's output shape |
| `updatedMCPToolOutput` | Replaces output for MCP tools only. Prefer `updatedToolOutput` which works for all tools |

## Special behaviour

### Exit code 2 shows stderr

Exiting with code 2 shows stderr to Claude even though the tool already ran. This is the way to surface a `PostToolUse` warning to Claude.

### MCP tool output caveat

In some Claude Code versions, MCP tool output must be placed in `updatedMCPToolOutput` rather than `updatedToolOutput`. Prefer `updatedToolOutput`, which works for all tools, but be aware that older versions may require the MCP-specific field for output modification to take effect.

## References

- [Common input fields](../reference/common-input-fields.md)
- [JSON output fields](../reference/json-output.md)
