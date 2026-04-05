import type { GrammarError, TonePreset, UiLocale } from '../../shared/types'
import type { AIProvider } from './types'
import { buildGrammarPrompt, buildRewritePrompt, buildToneRewritePrompt, buildTranslatePrompt, parseGrammarErrors } from './prompts'
import { REQUEST_TIMEOUT_MS } from '../../shared/constants'

const BASE_URL = 'https://api.openai.com/v1/chat/completions'
const FETCH_TIMEOUT_MS = REQUEST_TIMEOUT_MS - 1_000

async function callOpenAI(prompt: string, apiKey: string, model: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    })
  } catch {
    clearTimeout(timer)
    throw new Error('AI service unreachable')
  }
  clearTimeout(timer)

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Invalid API key for OpenAI')
    if (response.status === 429) throw new Error('RATE_LIMIT')
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json() as { choices: Array<{ message: { content: string } }> }
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('Unexpected OpenAI API response shape')
  return text.trim()
}

export class OpenAIProvider implements AIProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string = 'gpt-4o-mini'
  ) {}

  async checkGrammar(text: string, language: string, uiLanguage: UiLocale): Promise<GrammarError[]> {
    const raw = await callOpenAI(buildGrammarPrompt(text, language, uiLanguage), this.apiKey, this.model)
    return parseGrammarErrors(raw)
  }

  async rewrite(text: string, selection: string | undefined, language: string, tone?: TonePreset): Promise<string> {
    const prompt = tone
      ? buildToneRewritePrompt(text, tone, language, selection)
      : buildRewritePrompt(text, selection, language)
    return callOpenAI(prompt, this.apiKey, this.model)
  }

  async translate(text: string, targetLanguage: string): Promise<string> {
    return callOpenAI(buildTranslatePrompt(text, targetLanguage), this.apiKey, this.model)
  }
}
