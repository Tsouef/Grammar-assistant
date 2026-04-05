import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OpenAIProvider } from './openai'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

const successResponse = (text: string) =>
  new Response(
    JSON.stringify({ choices: [{ message: { content: text } }] }),
    { status: 200 }
  )

describe('OpenAIProvider.checkGrammar', () => {
  it('throws "Invalid API key for OpenAI" on 401', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('', { status: 401 }))
    const provider = new OpenAIProvider('bad-key')
    await expect(provider.checkGrammar('test', 'auto')).rejects.toThrow('Invalid API key for OpenAI')
  })

  it('throws "AI service unreachable" on network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network'))
    const provider = new OpenAIProvider('key')
    await expect(provider.checkGrammar('test', 'auto')).rejects.toThrow('AI service unreachable')
  })

  it('sends Authorization Bearer header', async () => {
    vi.mocked(fetch).mockResolvedValue(successResponse('[]'))
    const provider = new OpenAIProvider('my-openai-key')
    await provider.checkGrammar('text', 'auto')
    const headers = vi.mocked(fetch).mock.calls[0][1]!.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer my-openai-key')
  })

  it('uses custom model in request body', async () => {
    vi.mocked(fetch).mockResolvedValue(successResponse('[]'))
    const provider = new OpenAIProvider('key', 'gpt-4o')
    await provider.checkGrammar('text', 'auto')
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)
    expect(body.model).toBe('gpt-4o')
  })

  it('returns parsed errors on success', async () => {
    const errors = [{ original: 'are', replacement: 'is', message: 'SVA', context: 'data are wrong' }]
    vi.mocked(fetch).mockResolvedValue(successResponse(JSON.stringify(errors)))
    const provider = new OpenAIProvider('key')
    const result = await provider.checkGrammar('data are wrong', 'auto')
    expect(result).toEqual(errors)
  })
})

describe('OpenAIProvider.rewrite', () => {
  it('returns trimmed rewritten text', async () => {
    vi.mocked(fetch).mockResolvedValue(successResponse('  Fixed.  '))
    const provider = new OpenAIProvider('key')
    expect(await provider.rewrite('Broken', undefined, 'auto')).toBe('Fixed.')
  })
})

describe('OpenAIProvider.translate', () => {
  it('returns trimmed translated text', async () => {
    vi.mocked(fetch).mockResolvedValue(successResponse('  Hello.  '))
    const provider = new OpenAIProvider('key')
    expect(await provider.translate('Bonjour', 'en-US')).toBe('Hello.')
  })
})
