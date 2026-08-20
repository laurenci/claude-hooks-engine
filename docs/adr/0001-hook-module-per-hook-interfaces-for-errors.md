# Hook modules and interface-based errors replace namespaces and classes

The library previously grouped hook-specific types and error classes under TypeScript `namespace` objects (e.g. `namespace PreToolUse { export class BlockingError ... }`). Namespaces were chosen for their ability to merge types and values under one dotted name, but they carry legacy connotations and are unfamiliar compared to standard module patterns.

We replaced this with per-hook ES modules exported as sub-paths (e.g. `import * as PreToolUse from 'claude-hooks-engine/pre-tool-use'`). Each hook module exports its `Payload` and `Response` types alongside `blockingError()` and `nonBlockingError()` factory functions. The module namespace is the grouping mechanism — no `namespace` keyword anywhere.

Alongside this, `HookError`, `BlockingHookError`, and `NonBlockingHookError` were changed from abstract classes to TypeScript interfaces. Errors are plain data objects (`{ kind, exitCode, outMessage?, errMessage? }`); `notify()` owns all IO rather than delegating to a `process(io)` method on the error. Runtime detection uses an `isHookError()` type guard keyed on the `kind` discriminant. This makes errors trivially testable (assert fields, no IO mocks) and removes class hierarchy machinery from the public API surface.

## Considered Options

- **Merged namespace + const**: `namespace PreToolUse` for types merged with `const PreToolUse` for values. Achieves the same dotted-name grouping without sub-path exports, but still requires the `namespace` keyword and the non-obvious merge pattern.
- **Flat exports with naming convention**: `PreToolUsePayload`, `PreToolUseBlockingError` — no grouping construct at all. Simpler, but loses the co-location signal and produces a large flat root barrel.

## Consequences

Breaking change — requires a major version bump. The single consumer needs a migration from `import { PreToolUse } from 'claude-hooks-engine'` and `new PreToolUse.BlockingError(...)` to `import * as PreToolUse from 'claude-hooks-engine/pre-tool-use'` and `throw PreToolUse.blockingError(...)`. Sub-path exports require an `exports` map in `package.json`.
