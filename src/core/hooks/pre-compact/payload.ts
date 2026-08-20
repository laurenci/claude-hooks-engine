import type { HookPayload } from '../hook-payload.js'

export interface Payload extends HookPayload<'PreCompact'> {
  trigger: 'manual' | 'auto'
}
