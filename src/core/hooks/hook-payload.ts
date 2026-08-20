import type { HookEvent } from '../hooks.js'

export interface HookPayload<T extends HookEvent> {
  session_id: string
  transcript_path: string
  hook_event_name: T
}

export interface PayloadNormalizer<E extends HookEvent, T extends HookPayload<E> = HookPayload<E>> {
  normalise: (rawData: Record<string, unknown>) => T | Promise<T>
}
