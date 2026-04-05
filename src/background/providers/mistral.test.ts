import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MistralProvider } from './mistral'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

const successResponse = (text: string) =>
  new Response(
    JSON.stringify({ choices: [{ message: { content: text } }] }),
    { status: 200 }
  )

describe('MistralProvider.checkGrammar', () => {
  it('throws "Invalid API key for Mistral" on 401', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('', { status: 401 }))
    const provider = new MistralProvider('bad-key')
    await expect(provider.checkGrammar('test', 'auto')).rejects.toThrow('Invalid API key for Mistral')
  })

  it('throws "AI service unreachable" on network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network'))
    const provider = new MistralProvider('key')
    await expect(provider.checkGrammar('test', 'auto')).rejects.toThrow('AI service unreachable')
  })

  it('sends Authorization Bearer header', async () => {
    vi.mocked(fetch).mockResolvedValue(successResponse('[]'))
    const provider = new MistralProvider('my-mistral-key')
    await provider.checkGrammar('text', 'auto')
    const headers = vi.mocked(fetch).mock.calls[0][1]!.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer my-mistral-key')
  })

  it('calls api.mistral.ai', async () => {
    vi.mocked(fetch).mockResolvedValue(successResponse('[]'))
    const provider = new MistralProvider('key')
    await provider.checkGrammar('text', 'auto')
    const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string
    expect(calledUrl).toContain('api.mistral.ai')
  })

  it('uses custom model in request body', async () => {
    vi.mocked(fetch).mockResolvedValue(successResponse('[]'))
    const provider = new MistralProvider('key', 'mistral-large-latest')
    await provider.checkGrammar('text', 'auto')
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)
    expect(body.model).toBe('mistral-large-latest')
  })

  it('returns parsed errors on success', async () => {
    const errors = [{ original: 'are', replacement: 'is', message: 'SVA', context: 'data are wrong' }]
    vi.mocked(fetch).mockResolvedValue(successResponse(JSON.stringify(errors)))
    const provider = new MistralProvider('key')
    expect(await provider.checkGrammar('data are wrong', 'auto')).toEqual(errors)
  })
})

describe('MistralProvider.rewrite', () => {
  it('returns trimmed rewritten text', async () => {
    vi.mocked(fetch).mockResolvedValue(successResponse('  Fixed.  '))
    const provider = new MistralProvider('key')
    expect(await provider.rewrite('Broken', undefined, 'auto')).toBe('Fixed.')
  })
})

describe('MistralProvider.translate', () => {
  it('returns trimmed translated text', async () => {
    vi.mocked(fetch).mockResolvedValue(successResponse('  Hello.  '))
    const provider = new MistralProvider('key')
    expect(await provider.translate('Bonjour', 'en-US')).toBe('Hello.')
  })
})
