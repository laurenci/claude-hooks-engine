# PreCompact

> Runs before Claude Code performs context compaction. Matcher value distinguishes manual (`/compact` command) from automatic compaction. Can block compaction by exiting with code 2 or returning `decision: "block"`.

## When it fires

Fires before Claude Code runs a context compaction operation. The matcher value indicates whether compaction was triggered:
- `"manual"` — user ran the `/compact` command
- `"auto"` — automatic compaction triggered by Claude Code

## Input fields

In addition to the [common input fields](../reference/common-input-fields.md), PreCompact hooks receive:

| Field | Description |
| :-- | :-- |
| `trigger` | `"manual"` or `"auto"` indicating how compaction was triggered |
| `custom_instructions` | For `manual` triggers: the text the user passed to `/compact`. Empty string for `auto` |

## Output / Decision control

PreCompact hooks can block compaction by:
- Exiting with code 2 (for `manual` compaction, the stderr message is shown to the user)
- Returning JSON with `decision: "block"`

However, Claude Code ignores the `systemMessage` and `continue` fields in PreCompact hook responses. Only the exit code 2 or `decision: "block"` affects the outcome.

| Field | Description |
| :-- | :-- |
| `decision` | `"block"` prevents compaction from proceeding |

To show a message to the user on manual compaction block, exit with code 2 and send the message via stderr.

## Special behaviour

### Discarded output fields

Unlike most hooks, PreCompact hooks ignore `systemMessage` and `continue` fields in the response. Only the exit code (specifically, exit code 2) or `decision: "block"` field determine whether compaction is blocked.

### Manual vs. auto blocking

For `manual` compaction (`trigger: "manual"`), if you block by exiting with code 2, the stderr message is displayed to the user. For `auto` compaction, exit code 2 silently blocks without user notification.

## References

- [Common input fields](../reference/common-input-fields.md)
