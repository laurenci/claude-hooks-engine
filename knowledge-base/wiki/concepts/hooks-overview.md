# Hooks Overview

Hooks are user-defined shell commands that Claude Code runs at specific points in its lifecycle. They give you **deterministic control**: certain actions always happen, rather than relying on the LLM to choose to run them.

For decisions requiring judgment rather than rules, hooks can also invoke a Claude model (prompt-based hooks) or a full agent (agent-based hooks).

> See also: [Common input fields](../reference/common-input-fields.md) · [JSON output](../reference/json-output.md) · [Exit codes](../reference/errors.md)

## How hooks work

When an event fires and a matcher matches, Claude Code passes a JSON payload about the event to your hook handler:

- **Command hooks**: payload arrives on stdin; response goes to stdout
- **HTTP hooks**: payload arrives as the POST request body

Your handler inspects the input, takes action, and optionally returns a decision.

## Lifecycle cadences

Events fall into three cadences:

| Cadence | Events |
| :-- | :-- |
| Once per session | `SessionStart`, `SessionEnd` |
| Once per turn | `UserPromptSubmit`, `Stop`, `StopFailure` |
| Per tool call (in the agentic loop) | `PreToolUse`, `PostToolUse` (skipped for `EndConversation` calls) |

## All hook events

| Event | When it fires |
| :-- | :-- |
| `SessionStart` | When a session begins or resumes |
| `Setup` | When you start Claude Code with `--init-only`, or with `--init` or `--maintenance` in `-p` mode. For one-time preparation in CI or scripts |
| `UserPromptSubmit` | When you submit a prompt, before Claude processes it |
| `UserPromptExpansion` | When a user-typed command expands into a prompt, before it reaches Claude. Can block the expansion |
| `PreToolUse` | Before a tool call executes. Can block it |
| `PermissionRequest` | When a tool call needs a permission decision |
| `PermissionDenied` | When auto mode denies a tool call, including denials without a classifier verdict. Use JSON `hookSpecificOutput.retry`: true to tell the model it may retry the denied tool call. Claude Code ignores `retry` when the classifier produced no verdict |
| `PostToolUse` | After a tool call succeeds |
| `PostToolUseFailure` | After a tool call fails |
| `PostToolBatch` | After a full batch of parallel tool calls resolves, before the next model call |
| `Notification` | When Claude Code sends a notification |
| `MessageDisplay` | While assistant message text is displayed |
| `SubagentStart` | When a subagent is spawned |
| `SubagentStop` | When a subagent finishes |
| `TaskCreated` | When a task is being created via `TaskCreate` |
| `TaskCompleted` | When a task is being marked as completed |
| `Stop` | When Claude finishes responding |
| `StopFailure` | When the turn ends due to an API error |
| `TeammateIdle` | When an agent team teammate is about to go idle |
| `InstructionsLoaded` | When a CLAUDE.md or `.claude/rules/*.md` file is loaded into context. Fires at session start and when files are lazily loaded during a session |
| `ConfigChange` | When a configuration file changes during a session |
| `CwdChanged` | When the working directory changes, for example when Claude executes a `cd` command. Useful for reactive environment management with tools like direnv |
| `DirectoryAdded` | When a working directory is added mid-session via `/add-dir` or the SDK `register_repo_root` control request |
| `FileChanged` | When a watched file changes on disk. The `matcher` field specifies which filenames to watch |
| `WorktreeCreate` | When a worktree is being created via `--worktree`, `isolation: "worktree"`, or for a background session. Replaces default git behavior |
| `WorktreeRemove` | When a worktree is being removed at session exit, when a subagent finishes, or when you delete a background session |
| `PreCompact` | Before context compaction |
| `PostCompact` | After context compaction completes |
| `Elicitation` | When an MCP server requests user input during a tool call |
| `ElicitationResult` | After a user responds to an MCP elicitation, before the response is sent back to the server |
| `SessionEnd` | When a session terminates |
