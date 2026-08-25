import type { HookPayload } from "../hook-payload.js";

export interface Payload extends HookPayload<"SubagentStart"> {
    agent_id: string,
    agent_type: string
}