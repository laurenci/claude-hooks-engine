import type { HookSpecificOutputResponse, HookSpecificOutput } from './hook.response.js'

export interface PostToolUseResponse extends HookSpecificOutputResponse<'PostToolUse'> {
  decision?: 'block'
  reason?: string
  hookSpecificOutput?: PostToolUseHookSpecificOutput
}

export interface PostToolUseHookSpecificOutput extends HookSpecificOutput<'PostToolUse'> {
  additionalContext?: string
  updatedToolOutput?: string
  updatedMCPToolOutput?: string
}
