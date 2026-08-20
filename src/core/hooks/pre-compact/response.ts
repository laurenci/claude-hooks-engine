import type { HookResponse } from '../hook-response.js'

export interface Response extends HookResponse {
  decision?: 'block'
  reason?: string
}
