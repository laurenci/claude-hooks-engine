import type {HookPayload} from './hook.payload.js'

export interface PreCompactPayload extends HookPayload<'PreCompact'> {
  trigger: 'manual' | 'auto'
}
