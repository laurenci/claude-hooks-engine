# Notification

> Runs when Claude Code sends a notification. Matches on notification type. Side-effects only — cannot block or modify notifications.

## When it fires

Fires when Claude Code sends a notification. Matches on notification type; omit the matcher to receive all notification types. Fires even when desktop notifications are disabled — the `preferredNotifChannel` setting (including `notifications_disabled`) affects delivery, not hook execution.

## Input fields

In addition to the [common input fields](../reference/common-input-fields.md), Notification hooks receive:

| Field | Description |
| :-- | :-- |
| `message` | Notification text |
| `title` | Optional. Notification title |
| `notification_type` | The notification type that fired |

## Output / Decision control

Notification hooks cannot block or modify notifications. Claude Code discards `systemMessage` and `continue` fields in the response. The only output field that takes effect is `terminalSequence`, which can be used for terminal-based notification forwarding.

Notification hooks are intended for side effects such as forwarding the notification to an external service (e.g. desktop notification systems, monitoring tools, logging systems).

## Special behaviour

### Side-effects only

Notification hooks cannot influence Claude Code's notification behavior. They run after the notification is already queued and can only observe it and perform external actions.

The only output field honoured is `terminalSequence`, which is useful for terminal-based examples or integrations.

Other output fields like `systemMessage` and `continue` are ignored by Notification hooks.

## References

- [Common input fields](../reference/common-input-fields.md)
