import type { HookSpecificOutputResponse, HookSpecificOutput } from '../hook-response.js'

export interface HookSpecificOutputFields extends HookSpecificOutput<'SubagentStop'> {
  additionalContext?: string
}

export interface Response extends HookSpecificOutputResponse<'SubagentStop'> {
  decision?: 'block'
  reason?: string
  hookSpecificOutput?: HookSpecificOutputFields
}
