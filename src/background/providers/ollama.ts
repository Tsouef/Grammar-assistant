import type { GrammarError, TonePreset, UiLocale } from '../../shared/types'
import type { AIProvider } from './types'
import { buildGrammarPrompt, buildRewritePrompt, buildToneRewritePrompt, buildTranslatePrompt, parseGrammarErrors } from './prompts'
import { REQUEST_TIMEOUT_MS } from '../../shared/constants'

const FETCH_TIMEOUT_MS = REQUEST_TIMEOUT_MS - 1_000

async function callOllama(prompt: string, baseUrl: string, model: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      }),
      signal: controller.signal,
    })
  } catch {
    clearTimeout(timer)
    throw new Error('AI service unreachable')
  }
  clearTimeout(timer)

  if (!response.ok) {
    if (response.status === 429) throw new Error('RATE_LIMIT')
    const body = await response.json().catch(() => null)
    const detail = body?.error ?? ''
    throw new Error(`Ollama API error: ${response.status}${detail ? ` — ${detail}` : ''}`)
  }

  const data = await response.json() as { message: { content: string } }
  const text = data.message?.content
  if (!text) throw new Error('Unexpected Ollama API response shape')
  return text.trim()
}

export async function fetchOllamaModels(baseUrl: string): Promise<string[]> {
  let response: Response
  try {
    response = await fetch(`${baseUrl}/api/tags`)
  } catch {
    throw new Error('OLLAMA_UNREACHABLE')
  }
  if (!response.ok) throw new Error('OLLAMA_UNREACHABLE')
  const data = await response.json() as { models: Array<{ name: string }> }
  return data.models.map((m) => m.name)
}

export class OllamaProvider implements AIProvider {
  constructor(
    private readonly baseUrl: string,
    private readonly model: string = ''
  ) {}

  async checkGrammar(text: string, language: string, uiLanguage: UiLocale): Promise<GrammarError[]> {
    const raw = await callOllama(buildGrammarPrompt(text, language, uiLanguage), this.baseUrl, this.model)
    return parseGrammarErrors(raw)
  }

  async rewrite(text: string, selection: string | undefined, language: string, tone?: TonePreset): Promise<string> {
    const prompt = tone
      ? buildToneRewritePrompt(text, tone, language, selection)
      : buildRewritePrompt(text, selection, language)
    return callOllama(prompt, this.baseUrl, this.model)
  }

  async translate(text: string, targetLanguage: string): Promise<string> {
    return callOllama(buildTranslatePrompt(text, targetLanguage), this.baseUrl, this.model)
  }
}
