import type { HookEvent } from './hooks.js'
import type { Payload as PreToolUsePayload, Response as PreToolUseResponse } from './hooks/pre-tool-use/index.js'
import type { Payload as PostToolUsePayload, Response as PostToolUseResponse } from './hooks/post-tool-use/index.js'
import type { Payload as NotificationPayload, Response as NotificationResponse } from './hooks/notification/index.js'
import type { Payload as StopPayload, Response as StopResponse } from './hooks/stop/index.js'
import type { Payload as SubagentStartPayload, Response as SubagentStartResponse } from './hooks/subagent-start/index.js'
import type { Payload as SubagentStopPayload, Response as SubagentStopResponse } from './hooks/subagent-stop/index.js'
import type { Payload as UserPromptSubmitPayload, Response as UserPromptSubmitResponse } from './hooks/user-prompt-submit/index.js'
import type { Payload as PreCompactPayload, Response as PreCompactResponse } from './hooks/pre-compact/index.js'
import type { Payload as SessionStartPayload, Response as SessionStartResponse } from './hooks/session-start/index.js'

interface HookMap {
  PreToolUse: { payload: PreToolUsePayload; response: PreToolUseResponse }
  PostToolUse: { payload: PostToolUsePayload; response: PostToolUseResponse }
  Notification: { payload: NotificationPayload; response: NotificationResponse }
  Stop: { payload: StopPayload; response: StopResponse }
  SubagentStart: { payload: SubagentStartPayload, response: SubagentStartResponse }
  SubagentStop: { payload: SubagentStopPayload; response: SubagentStopResponse }
  UserPromptSubmit: { payload: UserPromptSubmitPayload; response: UserPromptSubmitResponse }
  PreCompact: { payload: PreCompactPayload; response: PreCompactResponse }
  SessionStart: { payload: SessionStartPayload; response: SessionStartResponse }
}

export type HookHandler<E extends HookEvent> = (
  payload: HookMap[E]['payload']
) => Promise<HookMap[E]['response']> | HookMap[E]['response']

export type PreToolUseHandler = HookHandler<'PreToolUse'>
export type PostToolUseHandler = HookHandler<'PostToolUse'>
export type NotificationHandler = HookHandler<'Notification'>
export type StopHandler = HookHandler<'Stop'>
export type SubagentStartHandler = HookHandler<'SubagentStart'>
export type SubagentStopHandler = HookHandler<'SubagentStop'>
export type UserPromptSubmitHandler = HookHandler<'UserPromptSubmit'>
export type PreCompactHandler = HookHandler<'PreCompact'>
export type SessionStartHandler = HookHandler<'SessionStart'>
