import type { HookSpecificOutputResponse, HookSpecificOutput } from '../hook-response.js'

export interface HookSpecificOutputFields extends HookSpecificOutput<'Stop'> {
  additionalContext?: string
}

export interface Response extends HookSpecificOutputResponse<'Stop'> {
  decision?: 'block'
  reason?: string
  hookSpecificOutput?: HookSpecificOutputFields
}
