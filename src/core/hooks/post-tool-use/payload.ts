import type { HookPayload, PayloadNormalizer } from '../hook-payload.js'
import type { FileReader } from '../../io.js'

export interface Payload extends HookPayload<'PostToolUse'> {
  tool_name: string
  tool_input: Record<string, unknown>
  tool_response:
    | (Record<string, unknown> & { success?: boolean })
    | (Record<string, unknown> & { success?: boolean })[]
}

export function postToolUseNormalizer(
  readFile: FileReader
): PayloadNormalizer<'PostToolUse', Payload> {
  return {
    normalise: async (rawData) => {
      const base = rawData as Omit<Payload, 'tool_response'> & { tool_response: unknown }
      const rawResponse = base.tool_response

      if (typeof rawResponse !== 'string') {
        return base as Payload
      }

      const overflow = parseOverflowMessage(rawResponse)
      const toolResponse = await readOverflowFile(readFile, overflow)

      return {
        ...base,
        tool_response: toolResponse,
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
  const match = OVERFLOW_RE.exec(message)
  if (!match) throw new Error(OVERFLOW_PARSE_ERROR)

  const [, sizeStr, unit, filePath] = match

  if (!sizeStr || !unit || !filePath) {
    throw new Error(OVERFLOW_PARSE_ERROR)
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
    throw new Error(
      `Failed to read overflow file at "${overflow.savedFilePath}": ${err instanceof Error ? err.message : String(err)}`
    )
  }
}
