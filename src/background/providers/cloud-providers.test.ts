import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClaudeProvider } from './claude'
import { OpenAIProvider } from './openai'
import { MistralProvider } from './mistral'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

type AIProvider = {
  checkGrammar(text: string, language: string, uiLanguage: string): Promise<unknown[]>
  rewrite(text: string, selection: undefined, language: string): Promise<string>
  translate(text: string, targetLanguage: string): Promise<string>
}

function testCloudProvider(
  suiteName: string,
  makeProvider: (key: string, model?: string) => AIProvider,
  makeResponseBody: (text: string) => object,
  checkAuthHeaders: (headers: Record<string, string>, key: string) => void,
  authErrorMessage: string
) {
  describe(suiteName, () => {
    const ok = (text: string) =>
      new Response(JSON.stringify(makeResponseBody(text)), { status: 200 })

    it(`throws "${authErrorMessage}" on 401`, async () => {
      vi.mocked(fetch).mockResolvedValue(new Response('', { status: 401 }))
      await expect(makeProvider('bad-key').checkGrammar('test', 'auto', 'en')).rejects.toThrow(
        authErrorMessage
      )
    })

    it('throws "AI service unreachable" on network error', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('network'))
      await expect(makeProvider('key').checkGrammar('test', 'auto', 'en')).rejects.toThrow(
        'AI service unreachable'
      )
    })

    it('sends correct auth headers', async () => {
      vi.mocked(fetch).mockResolvedValue(ok('[]'))
      await makeProvider('my-test-key').checkGrammar('text', 'auto', 'en')
      const headers = vi.mocked(fetch).mock.calls[0][1]!.headers as Record<string, string>
      checkAuthHeaders(headers, 'my-test-key')
    })

    it('uses custom model in request', async () => {
      vi.mocked(fetch).mockResolvedValue(ok('[]'))
      await makeProvider('key', 'custom-model').checkGrammar('text', 'auto', 'en')
      const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)
      expect(body.model).toBe('custom-model')
    })

    it('returns parsed grammar errors on success', async () => {
      const errors = [
        { original: 'are', replacement: 'is', message: 'SVA', context: 'data are wrong' },
      ]
      vi.mocked(fetch).mockResolvedValue(ok(JSON.stringify(errors)))
      expect(await makeProvider('key').checkGrammar('data are wrong', 'auto', 'en')).toEqual(errors)
    })

    it('returns trimmed text for rewrite', async () => {
      vi.mocked(fetch).mockResolvedValue(ok('  Fixed.  '))
      expect(await makeProvider('key').rewrite('Broken', undefined, 'auto')).toBe('Fixed.')
    })

    it('returns trimmed text for translate', async () => {
      vi.mocked(fetch).mockResolvedValue(ok('  Hello.  '))
      expect(await makeProvider('key').translate('Bonjour', 'en-US')).toBe('Hello.')
    })
  })
}

testCloudProvider(
  'ClaudeProvider',
  (key, model) => new ClaudeProvider(key, model),
  (text) => ({ content: [{ type: 'text', text }] }),
  (headers, key) => {
    expect(headers['x-api-key']).toBe(key)
    expect(headers['anthropic-version']).toBe('2023-06-01')
  },
  'Invalid API key for Claude'
)

testCloudProvider(
  'OpenAIProvider',
  (key, model) => new OpenAIProvider(key, model),
  (text) => ({ choices: [{ message: { content: text } }] }),
  (headers, key) => expect(headers['Authorization']).toBe(`Bearer ${key}`),
  'Invalid API key for OpenAI'
)

testCloudProvider(
  'MistralProvider',
  (key, model) => new MistralProvider(key, model),
  (text) => ({ choices: [{ message: { content: text } }] }),
  (headers, key) => expect(headers['Authorization']).toBe(`Bearer ${key}`),
  'Invalid API key for Mistral'
)

describe('MistralProvider — API endpoint', () => {
  it('calls api.mistral.ai', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: '[]' } }] }), { status: 200 })
    )
    await new MistralProvider('key').checkGrammar('text', 'auto', 'en')
    expect(vi.mocked(fetch).mock.calls[0][0] as string).toContain('api.mistral.ai')
  })
})
