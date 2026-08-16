# claude-hooks-engine

`claude-hooks-engine` is a type-safe observer framework for writing [Claude Code](https://claude.ai/code) hook scripts in TypeScript/Bun. It handles stdin/stdout I/O, provides typed payload and response shapes for all Claude Code lifecycle events, and exposes a fluent `.subscribe().notify()` API so you can focus on handler logic rather than plumbing.

## Install

```bash
bun add claude-hooks-engine
```

Requires Bun and TypeScript 5+.

## Quick Start

**Entry point (`hook.ts`):**

```typescript
#!/usr/bin/env bun
import { createObserver, extractArgs, standartIOProvider } from 'claude-hooks-engine'
import { myHandler } from './my-handler'

const args = extractArgs(Bun.argv)

await createObserver(standartIOProvider)
  .subscribe('PostToolUse', 'my-tool', myHandler)
  .notify(args.hookName, args.eventName)
```

`extractArgs` parses `hookName` and `eventName` from `Bun.argv` (passed by Claude Code). The observer routes the incoming event to matching subscribers. Returning `{}` from a handler is a no-op passthrough.

**Handler (`my-handler.ts`):**

```typescript
import type { PostToolUseHandler } from 'claude-hooks-engine'
import { createLogger } from 'claude-hooks-engine'

const log = createLogger('my-handler')

export const myHandler: PostToolUseHandler = async payload => {
  if (payload.tool_name !== 'mcp__my_plugin__myTool') return {}

  log.info('processing tool response')

  return {
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      updatedMCPToolOutput: JSON.stringify({ result: 'processed' }),
      additionalContext: 'Done',
    },
  }
}
```

## Hook Events

| Event | Fires when |
|---|---|
| `PreToolUse` | Before a tool call is executed |
| `PostToolUse` | After a tool call completes |
| `Notification` | Claude emits a notification |
| `Stop` | The main agent finishes a turn |
| `SubagentStop` | A subagent finishes a turn |
| `UserPromptSubmit` | A user prompt is submitted |
| `PreCompact` | Before context compaction runs |
| `SessionStart` | At the start of a new session |

Each event has a typed handler alias (`PreToolUseHandler`, `PostToolUseHandler`, etc.) and typed payload/response shapes exported from the package.

## Logging

The library logs internally via [LogTape](https://logtape.org) under the `hooks-engine` category. It never calls `configure()` — you own the setup.

### Console (development)

```typescript
import { configure, getConsoleSink } from '@logtape/logtape'

await configure({
  sinks: { console: getConsoleSink() },
  loggers: [
    { category: ['hooks-engine'], sinks: ['console'], lowestLevel: 'debug' },
    { category: ['my-app'],       sinks: ['console'], lowestLevel: 'info'  },
  ],
})
```

### File sink with time rotation (production)

Install `@logtape/file` first: `bun add @logtape/file`

```typescript
import { configure } from '@logtape/logtape'
import { getTimeRotatingFileSink } from '@logtape/file'
import { join } from 'node:path'
import { homedir } from 'node:os'

const LOG_DIR = join(homedir(), '.claude', 'hooks')

await configure({
  sinks: {
    file: getTimeRotatingFileSink({
      directory: LOG_DIR,
      interval: 'daily',
      maxAgeMs: 7 * 24 * 60 * 60 * 1000, // keep 7 days
    }),
  },
  loggers: [
    { category: ['hooks-engine'], sinks: ['file'], lowestLevel: 'debug' },
    { category: ['my-app'],       sinks: ['file'], lowestLevel: 'info'  },
  ],
})
```

Call `configure()` before `createObserver(...)`.

## License

MIT
