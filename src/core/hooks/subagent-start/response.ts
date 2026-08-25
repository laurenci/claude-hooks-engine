import type { HookSpecificOutputResponse, HookSpecificOutput } from '../hook-response.js'

export interface HookSpecificOutputFields extends HookSpecificOutput<'SubagentStart'> {
    additionalContext?: string
}

export interface Response extends HookSpecificOutputResponse<'SubagentStart'> {
    hookSpecificOutput?: HookSpecificOutputFields
}