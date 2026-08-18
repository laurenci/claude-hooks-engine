# Exit Codes

The exit code from your hook command tells Claude Code whether the action should proceed, be blocked, or be ignored. Exit codes and JSON output work together — Claude Code reads JSON from stdout on every exit code, not just 0. The one outcome JSON cannot override is exit 2's block.

## Exit code 0

For events that use the standard decision model, exit 0 with a parsed JSON object that fails schema validation is a non-blocking error: the action proceeds, and the transcript shows a hook error notice with the validation message. The same applies to any exit code other than 2, while exit 2 still blocks.

Stderr from a hook that exits 0 goes to the debug log only, never the transcript. To surface a warning to Claude from a `PostToolUse` or `PostToolUseFailure` hook, exit 2 instead so Claude sees the stderr even though the tool already ran.

## Exit code 2

Exit 2 means a blocking error. On events that can block, exit 2 blocks whether or not you print JSON: even a JSON `permissionDecision` of "allow" cannot override it. Claude Code still reads any valid JSON output on stdout. On `Elicitation` and `ElicitationResult`, an exit-2 hook's `hookSpecificOutput` is ignored.

The blocking message is the reason from your JSON's blocking decision when it makes one, and your stderr text otherwise. The effect of the block varies by event: `PreToolUse` blocks the tool call, `UserPromptSubmit` rejects the prompt, and so on.

A hook that exits 2 while printing JSON that fails JSON output schema validation still blocks: Claude Code uses stderr as the blocking reason and records the validation failure in the debug log.

## Exit code 2 behavior per event

Exit code 2 signals "stop, don't do this." The effect depends on the event, because some events represent preventable actions (like a tool call that hasn't happened yet) while others represent actions that already occurred or cannot be prevented:

| Hook event | Can block? | What happens on exit 2 |
| :-- | :-- | :-- |
| PreToolUse | Yes | Blocks the tool call |
| PermissionRequest | No | Exit code 2 is not honored; the permission flow proceeds unchanged. Use the decision object to deny instead |
| UserPromptSubmit | Yes | Blocks prompt processing and erases the prompt |
| UserPromptExpansion | Yes | Blocks the expansion |
| Stop | Yes | Prevents Claude from stopping; the conversation continues |
| SubagentStop | Yes | Prevents the subagent from stopping |
| TeammateIdle | Yes | Prevents the teammate from going idle; it continues working |
| TaskCreated | Yes | Rolls back the task creation |
| TaskCompleted | Yes | Prevents the task from being marked as completed |
| ConfigChange | Yes | Blocks the configuration change from taking effect (except `policy_settings`) |
| StopFailure | No | Output and exit code are ignored, except `terminalSequence` |
| PostToolUse | No | Shows stderr to Claude; the tool already ran |
| PostToolUseFailure | No | Shows stderr to Claude; the tool already failed |
| PostToolBatch | Yes | Stops the agentic loop before the next model call |
| PermissionDenied | No | Exit code and stderr are ignored because the denial already occurred. Use JSON `hookSpecificOutput.retry: true` to tell the model it may retry |
| Notification | No | Exit code and stderr are ignored |
| SubagentStart | No | Shows stderr to user only |
| SessionStart | No | Shows stderr to user only |
| Setup | No | Shows stderr to user only |
| SessionEnd | No | Shows stderr to user only |
| CwdChanged | No | Shows stderr to user only |
| DirectoryAdded | No | Stderr goes to the debug log; the directory is already added |
| FileChanged | No | Shows stderr to user only |
| PreCompact | Yes | Blocks compaction |
| PostCompact | No | Shows stderr to user only |
| Elicitation | Yes | Denies the elicitation |
| ElicitationResult | Yes | Blocks the response (action becomes decline) |
| WorktreeCreate | Yes | Any non-zero exit code causes worktree creation to fail |
| WorktreeRemove | No | Failures are logged in debug mode only |
| InstructionsLoaded | No | Exit code is ignored |
| MessageDisplay | No | The original text is displayed |

## Other exit codes

Any other exit code doesn't block on its own for most hook events. What happens depends on your stdout:

- With a parsed object that passes schema validation, for events that use the standard decision model, Claude Code ignores the exit code and the JSON alone decides the outcome. Each field the event supports is honored, including `permissionDecision`, `additionalContext`, `updatedInput`, and `systemMessage`, and the hook is not reported as an error.

- With a parsed object that fails schema validation, for events that use the standard decision model, it is a non-blocking error: the action proceeds, and the transcript shows a hook error notice with the validation message.

- With stdout that Claude Code treats as plain text, or with empty stdout, it is a non-blocking error for most hook events: the action proceeds, and the transcript shows a hook error notice followed by the first line of stderr, prefixed with `Failed with non-blocking status code:`. Enable debug logging to capture the full stderr.

**Exception:** `WorktreeCreate` treats any non-zero exit code as a failure that aborts worktree creation.

> **Use exit 2 for policy enforcement.** For most hook events, exit code 2 is the only exit code that blocks through the code alone. Without valid JSON on stdout, Claude Code treats exit code 1 as a non-blocking error and proceeds with the action, even though 1 is the conventional Unix failure code. To enforce a policy, use exit 2. The exception is `WorktreeCreate`, where any non-zero exit code aborts creation.

## References

- https://code.claude.com/docs/en/hooks#exit-codes
