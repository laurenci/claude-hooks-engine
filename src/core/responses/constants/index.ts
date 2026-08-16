import type { HookResponse } from "../hook.response.js";

export const nonBlockingErrorMessage = (systemMessage : string) => ({
    continue: true,
    systemMessage: systemMessage
}) as HookResponse;