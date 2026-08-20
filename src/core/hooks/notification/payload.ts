import type { HookPayload } from '../hook-payload.js'

export interface Payload extends HookPayload<'Notification'> {
  message: string
  title?: string
}
