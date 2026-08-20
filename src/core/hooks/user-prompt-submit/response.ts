import type { HookSpecificOutputResponse, HookSpecificOutput } from '../hook-response.js'

export interface HookSpecificOutputFields extends HookSpecificOutput<'UserPromptSubmit'> {
  additionalContext?: string
}

export interface Response extends HookSpecificOutputResponse<'UserPromptSubmit'> {
  decision?: 'block'
  reason?: string
  hookSpecificOutput?: HookSpecificOutputFields
}
