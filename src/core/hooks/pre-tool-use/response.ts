import type { HookSpecificOutputResponse, HookSpecificOutput } from '../hook-response.js'

export interface HookSpecificOutputFields extends HookSpecificOutput<'PreToolUse'> {
  permissionDecision?: 'allow' | 'deny' | 'ask' | 'defer'
  permissionDecisionReason?: string
  updatedInput?: Record<string, unknown>
}

export interface Response extends HookSpecificOutputResponse<'PreToolUse'> {
  hookSpecificOutput?: HookSpecificOutputFields
}
