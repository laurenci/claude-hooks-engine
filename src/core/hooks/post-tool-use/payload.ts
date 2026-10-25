import type { HookPayload, PayloadNormalizer } from '../hook-payload.js'
import type { FileReader } from '../../../io.js'

export interface Payload extends HookPayload<'PostToolUse'> {
  tool_name: string
  tool_input: Record<string, unknown>
  tool_response:
    | (Record<string, unknown> & { success?: boolean })
    | (Record<string, unknown> & { success?: boolean })[]
}

export type NormalizationFailure = 'unrecognized-string' | 'overflow-read-failed'

export class NormalizationError extends Error {
  constructor(
    readonly reason: NormalizationFailure,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options)
    this.name = 'NormalizationError'
  }
}

export interface PostToolUseNormalizerOptions {
  /**
   * Which tools may produce an overflow response. Other tools pass through untouched.
   * Default: MCP tools (`mcp__*`), the only tools Claude Code saves to an overflow file.
   */
  tools?: RegExp | ((toolName: string) => boolean)
  /**
   * Called when a matching tool returns a string that is not a readable overflow message.
   * Return a payload to recover (e.g. `rawData` as-is); throw or omit to fail.
   * Failures propagate to the observer, which reports them as a non-blocking `systemMessage`.
   */
  onError?: (error: NormalizationError, rawData: Record<string, unknown>) => Payload | Promise<Payload>
}

const MCP_TOOL_NAME = /^mcp__/

export function postToolUseNormalizer(
  readFile: FileReader,
  options: PostToolUseNormalizerOptions = {},
): PayloadNormalizer<'PostToolUse', Payload> {
  const { tools = MCP_TOOL_NAME, onError } = options
  const matchesTool = (name: unknown): boolean =>
    typeof name === 'string' && (typeof tools === 'function' ? tools(name) : tools.test(name))

  return {
    normalise: async (rawData) => {
      const base = rawData as Omit<Payload, 'tool_response'> & { tool_response: unknown }
      const rawResponse = base.tool_response

      if (typeof rawResponse !== 'string' || !matchesTool(base.tool_name)) {
        return base as Payload
      }

      try {
        const overflow = parseOverflowMessage(rawResponse)
        const toolResponse = await readOverflowFile(readFile, overflow)
        return { ...base, tool_response: toolResponse }
      } catch (err) {
        if (!onError) throw err
        if (!(err instanceof NormalizationError)) throw err
        return onError(err, rawData)
      }
    },
  }
}

const OVERFLOW_RE =
  /^Error: result \(([\d,]+)\s*(characters|tokens)\) exceeds maximum allowed tokens\. Output has been saved to (.+?)\.\n/

interface OverflowMatch {
  originalSize: number
  sizeUnit: 'characters' | 'tokens'
  savedFilePath: string
  schemaHint?: string
}

const OVERFLOW_PARSE_ERROR =
  'tool_response can only be a string when it matches the overflow error structure'

function parseOverflowMessage(message: string): OverflowMatch {
  const [, sizeStr, unit, filePath] = OVERFLOW_RE.exec(message) ?? []

  if (!sizeStr || !unit || !filePath) {
    throw new NormalizationError('unrecognized-string', OVERFLOW_PARSE_ERROR)
  }

  const schemaMatch = /Format:\s*(.+)/.exec(message)

  return {
    originalSize: Number(sizeStr.replace(/,/g, '')),
    sizeUnit: unit as 'characters' | 'tokens',
    savedFilePath: filePath.trim(),
    schemaHint: schemaMatch?.[1]?.trim(),
  }
}

async function readOverflowFile(
  readFile: FileReader,
  overflow: OverflowMatch
): Promise<Payload['tool_response']> {
  try {
    return (await readFile(overflow.savedFilePath)) as Record<string, unknown>[]
  } catch (err) {
    throw new NormalizationError(
      'overflow-read-failed',
      `Failed to read overflow file at "${overflow.savedFilePath}": ${err instanceof Error ? err.message : String(err)}`,
      { cause: err },
    )
  }
}
