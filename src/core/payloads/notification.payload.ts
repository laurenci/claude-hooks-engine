import type {HookPayload} from './hook.payload.js'

export interface NotificationPayload extends HookPayload<'Notification'> {
  message: string
  title?: string
}
