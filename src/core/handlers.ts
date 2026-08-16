import type { HookEvent } from "./hooks.js";
import type {
    PreToolUsePayload,
    PostToolUsePayload,
    NotificationPayload,
    StopPayload,
    SubagentStopPayload,
    UserPromptSubmitPayload,
    PreCompactPayload,
    SessionStartPayload
} from "./payloads/index.js"

import type {
    BaseHookResponse,
    PreToolUseResponse,
    PostToolUseResponse,
    StopResponse,
    UserPromptSubmitResponse,
    PreCompactResponse,
    SessionStartResponse
} from "./responses/index.js";

interface HookMap {
  PreToolUse: { payload: PreToolUsePayload; response: PreToolUseResponse }
  PostToolUse: { payload: PostToolUsePayload; response: PostToolUseResponse }
  Notification: { payload: NotificationPayload; response: BaseHookResponse }
  Stop: { payload: StopPayload; response: StopResponse }
  SubagentStop: { payload: SubagentStopPayload; response: StopResponse }
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
export type SubagentStopHandler = HookHandler<'SubagentStop'>
export type UserPromptSubmitHandler = HookHandler<'UserPromptSubmit'>
export type PreCompactHandler = HookHandler<'PreCompact'>
export type SessionStartHandler = HookHandler<'SessionStart'>
