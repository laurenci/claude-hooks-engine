# UserPromptSubmit

> Runs once per turn when the user submits a prompt, before Claude processes it. Add context based on the prompt, validate it, or block certain prompt types.

## When it fires

Fires when the user submits a prompt, before Claude processes it.

**Timeout:** Default timeout is 30 seconds for `command`, `http`, and `mcp_tool` types — shorter than the 600-second default on most other events. If your hook needs more time, set the `timeout` field in the hook entry. A timed-out hook is cancelled; its `additionalContext` is discarded and the prompt still reaches Claude without that context. The transcript shows a notice naming the hook, the timeout value, and that output was discarded.

## Input fields

In addition to the [common input fields](../reference/common-input-fields.md), UserPromptSubmit hooks receive:

| Field | Description |
| :-- | :-- |
| `prompt` | The text the user submitted |

## Output / Decision control

In addition to the [common output fields](../reference/json-output.md), UserPromptSubmit hooks can return the following fields. Note that `decision` and `reason` are **top-level** fields, while `additionalContext`, `sessionTitle`, and `suppressOriginalPrompt` go inside a **`hookSpecificOutput`** object (with `hookEventName: "UserPromptSubmit"`):

| Field | Placement | Description |
| :-- | :-- | :-- |
| `decision` | top-level | `"block"` prevents the prompt from being processed and erases it from context. Omit to allow the prompt to proceed |
| `reason` | top-level | Shown to the user when `decision` is `"block"`. Not added to context |
| `additionalContext` | `hookSpecificOutput` | String added to Claude's context alongside the submitted prompt |
| `sessionTitle` | `hookSpecificOutput` | Sets the session title based on prompt content |
| `suppressOriginalPrompt` | `hookSpecificOutput` | If `true` when blocking, omits the prompt text from the block message shown to the user |

**Two ways to add context on exit 0:**
- **Plain text stdout:** Claude Code adds stdout as plain text to Claude's context
- **JSON `additionalContext`:** Use JSON format for more control, placing the field inside `hookSpecificOutput`

```json
{
  "decision": "block",
  "reason": "Explanation for decision",
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "My additional context here",
    "sessionTitle": "My session title"
  }
}
```

A hook that blocks by exiting 2 routes the same way as `reason`: the block message shows stderr text to the user, and it is not added to context.

## Special behaviour

### Timeout and output discard

If a UserPromptSubmit hook exceeds its timeout (default 30 seconds), the hook is cancelled and all output including `additionalContext` is discarded. The prompt still reaches Claude. The transcript displays a notice showing the hook name, timeout value, and that output was discarded.

## References

- [Common input fields](../reference/common-input-fields.md)
- [JSON output fields](../reference/json-output.md)
