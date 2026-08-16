import type {HookSpecificOutputResponse, HookSpecificOutput} from './hook.response.js'

export interface PreToolUseResponse extends HookSpecificOutputResponse<'PreToolUse'> {
  hookSpecificOutput?: PreToolUseHookSpecificOutput
}

export interface PreToolUseHookSpecificOutput extends HookSpecificOutput<'PreToolUse'> {
    permissionDecision?: 'allow' | 'deny' | 'ask' | 'defer'
    permissionDecisionReason?: string
    updatedInput?: Record<string, unknown>
}
