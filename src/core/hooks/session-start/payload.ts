import type { HookPayload } from '../hook-payload.js'

const Source = {
  startup: "startup",
  resume: "resume",
  clear: "clear",
  compact: "compact",
  fork: "fork"
} as const;
type Source = typeof Source[keyof typeof Source];

export interface Payload extends HookPayload<'SessionStart'> {
  source: Source
}
