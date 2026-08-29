# `onFinish` as an Observer method rather than an exported `finish()` function

`notify()` calls `process.exit()` directly when a `HookError` is thrown. This
bypasses the Bun/Node event loop, meaning async log sinks (e.g. logtape file
sinks) may not flush before the process terminates.

To address this, we add `observer.onFinish(cb: () => Promise<void>): Observer`
— a method that accumulates Cleanup Callbacks on the Observer. Callbacks are
drained on **every code path** — happy path, HookError, and unknown error —
via a `finally` block in `notify()`. The exit code (if any) is captured before
the finally, and `process.exit()` is called after it. Errors thrown by
callbacks are logged and swallowed; the exit always proceeds.

The key design question was where consumers obtain the exit function that
triggers cleanup. Two alternatives were considered:

## Considered Options

- **Return `finish` from `createObserver()`**: `const { observer, finish } = createObserver(io)`. The returned `finish: (code: number) => Promise<never>` closes over the registered callbacks. Consumer calls `finish()` for their own early exits (e.g. arg validation) as well. Requires changing `createObserver()`'s return type — a breaking API change — and introduces a second exit path consumers must know about and use consistently.

- **Module-level registry**: `observer.onFinish(cb)` writes into a global registry; standalone `finish(code)` drains it. Avoids the return-type change but introduces shared mutable global state, making multiple Observer instances per process unpredictable.

- **`onFinish` on Observer only (chosen)**: Cleanup callbacks are scoped to the Observer instance. `notify()` owns the exit path entirely — no public `finish()` is exposed. `createObserver()` return type is unchanged. For early exits before an Observer exists (e.g. invalid CLI args), the consumer calls `process.exit()` directly; nothing has been initialised at that point so there is nothing to flush.

## Consequences

No breaking change to the `createObserver()` return type. The `Observer`
interface gains one method. Consumers cannot reuse the cleanup-then-exit path
for their own early exits — this is an accepted trade-off given that such exits
occur before any async resources are initialised.
