export { createObserver } from './src/observer.js'
export { createLogger } from './src/logger.js'
export { extractArgs } from './src/args.js'
export { standartIOProvider, bunFileReader } from './src/io.js'
export { HookEvent } from './src/core/hooks.js'
export { isHookError } from './src/core/hooks/hook-error.js'

export type { IO, IOProvider, FileReader } from './src/io.js'
export type { HookHandler } from './src/core/handlers.js'
export type {
  PreToolUseHandler,
  PostToolUseHandler,
  NotificationHandler,
  StopHandler,
  SubagentStartHandler,
  SubagentStopHandler,
  UserPromptSubmitHandler,
  PreCompactHandler,
  SessionStartHandler,
} from './src/core/handlers.js'
export type { HookError, BlockingHookError, NonBlockingHookError } from './src/core/hooks/hook-error.js'
export type { PayloadNormalizer } from './src/core/hooks/hook-payload.js'
