import type {HookResponse} from './hook.response.js'

export interface PreCompactResponse extends HookResponse {
  decision?: 'block'
  reason?: string
}
