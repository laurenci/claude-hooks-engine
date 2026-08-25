export const HookEvent = {
  PreToolUse: "PreToolUse",
  PostToolUse: "PostToolUse",
  Notification: "Notification",
  Stop: "Stop",
  SubagentStart: "SubagentStart",
  SubagentStop: "SubagentStop",
  UserPromptSubmit: "UserPromptSubmit",
  PreCompact: "PreCompact",
  SessionStart: "SessionStart"
} as const;
export type HookEvent = typeof HookEvent[keyof typeof HookEvent];