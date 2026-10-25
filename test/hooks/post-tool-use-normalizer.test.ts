import { describe, test, expect } from 'bun:test'
import { postToolUseNormalizer, NormalizationError } from '../../src/core/hooks/post-tool-use/index'
import type { Payload } from '../../src/core/hooks/post-tool-use/index'
import { createObserver } from '../../src/observer'
import type { IO } from '../../src/io'

const OVERFLOW = 'Error: result (100 characters) exceeds maximum allowed tokens. Output has been saved to /tmp/o.json.\nFormat: JSON'
const FILE_CONTENT = [{ type: 'text', text: 'from file' }]
const readFile = async () => FILE_CONTENT

const errorOf = (promise: unknown) => Promise.resolve(promise).catch((e: unknown) => e)

const raw = (tool_name: string, tool_response: unknown) => ({ tool_name, tool_input: {}, tool_response })

describe('postToolUseNormalizer', () => {
  test('built-in tool with a plain string response passes through', async () => {
    const input = raw('Read', 'file contents')
    expect(await postToolUseNormalizer(readFile).normalise(input)).toBe(input as never)
  })

  test('non-string responses pass through', async () => {
    const input = raw('mcp__x__y', [{ type: 'text', text: 'a' }])
    expect(await postToolUseNormalizer(readFile).normalise(input)).toBe(input as never)
  })

  test('MCP overflow message is replaced with the file content', async () => {
    const out = await postToolUseNormalizer(readFile).normalise(raw('mcp__x__y', OVERFLOW))
    expect(out.tool_response).toEqual(FILE_CONTENT as never)
  })

  test('MCP tool with a non-overflow string throws NormalizationError by default', async () => {
    const err = (await errorOf(postToolUseNormalizer(readFile).normalise(raw('mcp__x__y', 'plain')))) as NormalizationError
    expect(err).toBeInstanceOf(NormalizationError)
    expect(err.reason).toBe('unrecognized-string')
  })

  test('overflow file read failure throws NormalizationError with cause', async () => {
    const boom = new Error('ENOENT')
    const err = (await errorOf(postToolUseNormalizer(async () => { throw boom }).normalise(raw('mcp__x__y', OVERFLOW)))) as NormalizationError
    expect(err).toBeInstanceOf(NormalizationError)
    expect(err.reason).toBe('overflow-read-failed')
    expect(err.cause).toBe(boom)
  })

  test('onError can recover with a payload', async () => {
    const input = raw('mcp__x__y', 'plain')
    const normalizer = postToolUseNormalizer(readFile, { onError: (_e, rawData) => rawData as unknown as Payload })
    expect(await normalizer.normalise(input)).toBe(input as never)
  })

  test('onError receives the reason and can rethrow', async () => {
    const seen: string[] = []
    const normalizer = postToolUseNormalizer(readFile, {
      onError: e => { seen.push(e.reason); throw e },
    })
    await expect(normalizer.normalise(raw('mcp__x__y', 'plain'))).rejects.toBeInstanceOf(NormalizationError)
    expect(seen).toEqual(['unrecognized-string'])
  })

  test('tools option widens the match (regex and predicate)', async () => {
    const byRegex = postToolUseNormalizer(readFile, { tools: /^(mcp__|Custom)/ })
    expect((await byRegex.normalise(raw('CustomTool', OVERFLOW))).tool_response).toEqual(FILE_CONTENT as never)
    const byFn = postToolUseNormalizer(readFile, { tools: name => name === 'Special' })
    expect((await byFn.normalise(raw('Special', OVERFLOW))).tool_response).toEqual(FILE_CONTENT as never)
  })
})

describe('observer + failing normalizer', () => {
  test('reports a non-blocking systemMessage and does not invoke the handler', async () => {
    const stdout: string[] = []
    const io = {
      in: { json: async () => ({ hook_event_name: 'PostToolUse', ...raw('mcp__x__y', 'plain') }) },
      out: { write: (s: string) => { stdout.push(s); return Promise.resolve(s.length) } },
      err: { write: () => Promise.resolve(0) },
    } as unknown as IO
    let called = false

    await createObserver(() => io)
      .withNormalizer('PostToolUse', postToolUseNormalizer(readFile))
      .subscribe('PostToolUse', 'evt', async () => { called = true; return {} })
      .notify('PostToolUse', 'evt')

    expect(called).toBe(false)
    expect(stdout).toHaveLength(1)
    expect(JSON.parse(stdout[0]!)).toMatchObject({ continue: true, systemMessage: expect.stringContaining('overflow') })
  })
})
