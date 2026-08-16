import { getLogger, type Logger } from '@logtape/logtape'

export function createLogger(...namespaces: string[]): Logger {
  return getLogger(["hooks-engine", ...namespaces]);
}
