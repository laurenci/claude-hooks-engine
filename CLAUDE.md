# claude-hooks-engine

A type-safe observer framework for writing [Claude Code](https://claude.ai/code) hook scripts in TypeScript/Bun.

## Project Overview

The library is built around the **observer pattern**. A consumer creates an `Observer` instance, registers handlers for specific hook events (e.g. `PostToolUse`) and event names, then calls `notify()` to dispatch. The observer reads the hook payload from stdin, routes it to the matching handler, and writes the response to stdout — the protocol Claude Code expects from hook scripts.

```
Claude Code → stdin (JSON payload)
                 ↓
         createObserver()
           .subscribe(hookName, eventName, handler)
           .notify(hookName, eventName)
                 ↓
              handler(payload) → response
                 ↓
Claude Code ← stdout (JSON response)
```

Key concepts:
- **HookEvent** — one of 8 lifecycle events (`PreToolUse`, `PostToolUse`, `Notification`, `Stop`, `SubagentStop`, `UserPromptSubmit`, `PreCompact`, `SessionStart`)
- **Handler** — a typed async function `(payload) => response`
- **PayloadNormalizer** — optional transformer applied to raw stdin JSON before the handler receives it
- **IOProvider** — abstraction over stdin/stdout; `standartIOProvider` is the built-in implementation

The public API is exported from the root `index.ts` barrel. `src/` contains only library internals. There are no example scripts or plugin implementations in this repo — those live in consumer projects.

## Commands

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build (JS bundle + TypeScript declarations)
bun run build
```
