import type {HookPayload} from './hook.payload.js'

export interface SessionStartPayload extends HookPayload<'SessionStart'> {
  source: string
}
