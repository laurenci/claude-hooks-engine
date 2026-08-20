import type { HookEvent } from '../hooks.js'

export interface HookResponse {
  continue?: boolean
  stopReason?: string
  suppressOutput?: boolean
  systemMessage?: string
  terminalSequence?: string
  additionalContext?: string
}

export interface HookSpecificOutput<T extends HookEvent> {
  hookEventName: T
}

export interface HookSpecificOutputResponse<T extends HookEvent> extends HookResponse {
  hookSpecificOutput?: HookSpecificOutput<T>
}
