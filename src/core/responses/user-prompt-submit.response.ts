import type {HookResponse, HookSpecificOutputResponse, HookSpecificOutput} from './hook.response.js'

export interface UserPromptSubmitResponse extends HookSpecificOutputResponse<'UserPromptSubmit'> {
  decision?: 'block'
  reason?: string
  hookSpecificOutput?: UserPromptSubmitResponseHookSpecificOutput
}

export interface UserPromptSubmitResponseHookSpecificOutput extends HookSpecificOutput<'UserPromptSubmit'> {
  additionalContext?: string
}