import type { HookPayload } from '../hook-payload.js'

export interface Payload extends HookPayload<'PreToolUse'> {
  tool_name: string
  tool_input: Record<string, unknown>
}
