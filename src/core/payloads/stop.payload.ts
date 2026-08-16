import type {HookPayload} from './hook.payload.js'

export interface StopPayload extends HookPayload<'Stop'> {
  stop_hook_active: boolean
}
