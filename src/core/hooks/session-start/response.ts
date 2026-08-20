import type { HookSpecificOutputResponse, HookSpecificOutput } from '../hook-response.js'

export interface HookSpecificOutputFields extends HookSpecificOutput<'SessionStart'> {
  additionalContext?: string
  initialUserMessage?: string
  watchPaths?: string[]
  sessionTitle?: string
  reloadSkills?: boolean
}

export interface Response extends HookSpecificOutputResponse<'SessionStart'> {
  hookSpecificOutput?: HookSpecificOutputFields
}
