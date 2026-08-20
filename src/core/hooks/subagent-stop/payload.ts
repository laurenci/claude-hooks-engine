import type { HookPayload } from '../hook-payload.js'

export interface Payload extends HookPayload<'SubagentStop'> {
  stop_hook_active: boolean
}
