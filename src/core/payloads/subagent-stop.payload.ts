import type {HookPayload} from './hook.payload.js'

export interface SubagentStopPayload extends HookPayload<'SubagentStop'> {
  stop_hook_active: boolean
}
