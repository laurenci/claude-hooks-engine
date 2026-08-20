import type { HookSpecificOutputResponse, HookSpecificOutput } from '../hook-response.js'

export interface HookSpecificOutputFields extends HookSpecificOutput<'PostToolUse'> {
  additionalContext?: string
  updatedToolOutput?: string
  updatedMCPToolOutput?: string
}

export interface Response extends HookSpecificOutputResponse<'PostToolUse'> {
  decision?: 'block'
  reason?: string
  hookSpecificOutput?: HookSpecificOutputFields
}
