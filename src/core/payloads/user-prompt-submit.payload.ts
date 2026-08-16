import type {HookPayload} from './hook.payload.js'

export interface UserPromptSubmitPayload extends HookPayload<'UserPromptSubmit'> {
  prompt: string
}
