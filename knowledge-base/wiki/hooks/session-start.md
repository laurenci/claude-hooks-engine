# SessionStart

> Runs once per session at startup, resume, clear, compaction, or fork — before the first prompt. Useful for loading development context or setting up environment variables.

## When it fires

SessionStart fires on every session start or transition:
- `startup` — new session
- `resume` — existing session resumed
- `clear` — after `/clear`
- `compact` — after context compaction
- `fork` — new session forked from an existing one

Runs before the first prompt is processed. Only `command` and `mcp_tool` hook types are supported. Keep these hooks fast — they run on every session start.

## Input fields

In addition to the [common input fields](../reference/common-input-fields.md), SessionStart hooks receive:

| Field | Description |
| :-- | :-- |
| `source` | How the session started: `"startup"`, `"resume"`, `"clear"`, `"compact"`, or `"fork"` |
| `model` | Active model identifier. May be absent after `/clear` or during conversation recovery — check before reading |
| `agent_type` | Agent name when started with `claude --agent <name>` |
| `session_title` | Current session title if already set (e.g. via `--name` or `/rename`). Check before emitting `sessionTitle` to avoid overwriting a user-set title |

## Output / Decision control

In addition to the [common output fields](../reference/json-output.md), SessionStart hooks can return event-specific fields. When using JSON output, these fields go inside a **`hookSpecificOutput`** object (with `hookEventName: "SessionStart"`):

| Field | Description |
| :-- | :-- |
| `additionalContext` | String added to Claude's context at conversation start, before the first prompt |
| `initialUserMessage` | First user message in non-interactive (`-p`) mode. Creates the first turn when no prompt is provided; follows after an explicit prompt if one is given |
| `sessionTitle` | Sets the session title (same effect as `/rename`). Applies when `source` is `"startup"`, `"resume"`, or `"fork"`; ignored on `"clear"` and `"compact"` |
| `watchPaths` | Array of absolute paths to watch for `FileChanged` events during this session |
| `reloadSkills` | Boolean. When `true`, Claude Code re-scans skill and command directories after hooks complete, making newly installed skills available in the same session starting with the first prompt |

**Note:** Plain stdout is automatically added to Claude's context for this event. Use JSON output only when combining context with other output fields such as `sessionTitle`. When using JSON, wrap event-specific fields in `hookSpecificOutput`:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Current branch: feat/auth-refactor\nUncommitted changes: src/auth.ts, src/login.tsx\nActive issue: #4211 Migrate to OAuth2",
    "sessionTitle": "auth-refactor"
  }
}
```

## Special behaviour

### Persist environment variables with CLAUDE_ENV_FILE

SessionStart hooks can persist environment variables for subsequent Bash commands by writing `export` statements to the file path in `$CLAUDE_ENV_FILE`. Use append (`>>`) to preserve variables set by other hooks.

To set individual variables:

```bash
#!/bin/bash

if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export NODE_ENV=production' >> "$CLAUDE_ENV_FILE"
  echo 'export DEBUG_LOG=true' >> "$CLAUDE_ENV_FILE"
  echo 'export PATH="$PATH:./node_modules/.bin"' >> "$CLAUDE_ENV_FILE"
fi

exit 0
```

To capture all environment changes from setup commands, compare exported variables before and after:

```bash
#!/bin/bash

ENV_BEFORE=$(export -p | sort)

# Run your setup commands that modify the environment
source ~/.nvm/nvm.sh
nvm use 20

if [ -n "$CLAUDE_ENV_FILE" ]; then
  ENV_AFTER=$(export -p | sort)
  comm -13 <(echo "$ENV_BEFORE") <(echo "$ENV_AFTER") >> "$CLAUDE_ENV_FILE"
fi

exit 0
```

`CLAUDE_ENV_FILE` is available only for SessionStart, Setup, CwdChanged, and FileChanged hooks.

## References

- [Common input fields](../reference/common-input-fields.md)
- [JSON output fields](../reference/json-output.md)
