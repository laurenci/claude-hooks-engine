import { HookEvent } from "./core/hooks.js";

export const extractArgs = (args : string[]) => {
  if (args.length !== 4) {
    throw new Error("hook process didn't start, please provide args: hookName, eventName");
  }

  const hookName = args[2] as HookEvent;

  if (!hookName || !HookEvent[hookName]) {
    throw new Error(`hook process didn't start, please provide a valid Hook Event name: ${hookName}`)
  }

  if (!args[3]) {
    throw new Error(`provided an empty eventName: ${args[3]}`)
  }

  const eventName = args[3];

  return { hookName, eventName }
}