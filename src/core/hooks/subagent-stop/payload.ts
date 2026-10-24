import type { HookPayload } from '../hook-payload.js'

export interface Payload extends HookPayload<'SubagentStop'> {
  agent_id: string
  agent_type: string
  stop_hook_active: boolean
}
