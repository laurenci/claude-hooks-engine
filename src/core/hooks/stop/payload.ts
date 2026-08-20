import type { HookPayload } from '../hook-payload.js'

export interface Payload extends HookPayload<'Stop'> {
  stop_hook_active: boolean
}
