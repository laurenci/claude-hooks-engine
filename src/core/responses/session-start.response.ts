import type {HookResponse, HookSpecificOutputResponse, HookSpecificOutput} from './hook.response.js'

export interface SessionStartResponse extends HookSpecificOutputResponse<'SessionStart'> {
  hookSpecificOutput?: SessionStartHookSpecificOutput
}

export interface SessionStartHookSpecificOutput extends HookSpecificOutput<'SessionStart'> {
  additionalContext?: string
  initialUserMessage?: string
  watchPaths?: string[]
  sessionTitle?: string
  reloadSkills?: boolean
}
