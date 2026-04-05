import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClaudeProvider } from './claude'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

const successResponse = (text: string) =>
  new Response(JSON.stringify({ content: [{ type: 'text', text }] }), { status: 200 })

describe('ClaudeProvider.checkGrammar', () => {
  it('throws "Invalid API key for Claude" on 401', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('', { status: 401 }))
    const provider = new ClaudeProvider('bad-key')
    await expect(provider.checkGrammar('test', 'auto', 'en')).rejects.toThrow(
      'Invalid API key for Claude'
    )
  })

  it('throws "AI service unreachable" on network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network'))
    const provider = new ClaudeProvider('key')
    await expect(provider.checkGrammar('test', 'auto', 'en')).rejects.toThrow(
      'AI service unreachable'
    )
  })

  it('sends x-api-key header', async () => {
    vi.mocked(fetch).mockResolvedValue(successResponse('[]'))
    const provider = new ClaudeProvider('my-claude-key')
    await provider.checkGrammar('text', 'auto', 'en')
    const headers = vi.mocked(fetch).mock.calls[0][1]!.headers as Record<string, string>
    expect(headers['x-api-key']).toBe('my-claude-key')
  })

  it('sends anthropic-version header', async () => {
    vi.mocked(fetch).mockResolvedValue(successResponse('[]'))
    const provider = new ClaudeProvider('key')
    await provider.checkGrammar('text', 'auto', 'en')
    const headers = vi.mocked(fetch).mock.calls[0][1]!.headers as Record<string, string>
    expect(headers['anthropic-version']).toBe('2023-06-01')
  })

  it('uses custom model in request body', async () => {
    vi.mocked(fetch).mockResolvedValue(successResponse('[]'))
    const provider = new ClaudeProvider('key', 'claude-opus-4-6')
    await provider.checkGrammar('text', 'auto', 'en')
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)
    expect(body.model).toBe('claude-opus-4-6')
  })

  it('returns parsed errors on success', async () => {
    const errors = [
      { original: 'are', replacement: 'is', message: 'SVA', context: 'data are wrong' },
    ]
    vi.mocked(fetch).mockResolvedValue(successResponse(JSON.stringify(errors)))
    const provider = new ClaudeProvider('key')
    const result = await provider.checkGrammar('data are wrong', 'auto', 'en')
    expect(result).toEqual(errors)
  })
})

describe('ClaudeProvider.rewrite', () => {
  it('returns trimmed rewritten text', async () => {
    vi.mocked(fetch).mockResolvedValue(successResponse('  Fixed.  '))
    const provider = new ClaudeProvider('key')
    expect(await provider.rewrite('Broken', undefined, 'auto')).toBe('Fixed.')
  })
})

describe('ClaudeProvider.translate', () => {
  it('returns trimmed translated text', async () => {
    vi.mocked(fetch).mockResolvedValue(successResponse('  Hello.  '))
    const provider = new ClaudeProvider('key')
    expect(await provider.translate('Bonjour', 'en-US')).toBe('Hello.')
  })
})
