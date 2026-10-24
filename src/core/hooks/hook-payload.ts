import type { HookEvent } from '../hooks.js'

const PermissionMode = {
  default: "default",
  plan: "plan",
  acceptEdits: "acceptEdits",
  auto: "auto",
  dontAsk: "dontAsk",
  bypassPermissions: "bypassPermissions"
} as const
type PermissionMode = typeof PermissionMode[keyof typeof PermissionMode]

export interface HookPayload<T extends HookEvent> {
  session_id: string
  cwd: string
  permission_mode: PermissionMode
  transcript_path: string
  hook_event_name: T
  agent_id?: string
  agent_type?: string
}

export interface PayloadNormalizer<E extends HookEvent, T extends HookPayload<E> = HookPayload<E>> {
  normalise: (rawData: Record<string, unknown>) => T | Promise<T>
}
