import type {HookResponse, HookSpecificOutputResponse, HookSpecificOutput} from './hook.response.js'

export interface StopResponse extends HookSpecificOutputResponse<'Stop' | 'SubagentStop'> {
  decision?: 'block'
  reason?: string
  hookSpecificOutput?: StopResponseHookSpecificOutput
}

export interface StopResponseHookSpecificOutput extends HookSpecificOutput<'Stop' | 'SubagentStop'> {
  additionalContext?: string
}