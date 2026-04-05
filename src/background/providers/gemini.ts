import type { GrammarError, TonePreset, UiLocale } from '../../shared/types'
import type { AIProvider, GeminiApiResponse } from './types'
import {
  buildGrammarPrompt,
  buildRewritePrompt,
  buildToneRewritePrompt,
  buildTranslatePrompt,
  parseGrammarErrors,
} from './prompts'
import { REQUEST_TIMEOUT_MS } from '../../shared/constants'

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const FETCH_TIMEOUT_MS = REQUEST_TIMEOUT_MS - 1_000 // cancel fetch before content script times out

async function callGemini(prompt: string, apiKey: string, model: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { thinkingConfig: { thinkingBudget: 0 } },
      }),
      signal: controller.signal,
    })
  } catch {
    clearTimeout(timer)
    throw new Error('AI service unreachable')
  }
  clearTimeout(timer)

  if (!response.ok) {
    console.error(`[Gemini] ${response.status}`)
    if (response.status === 400 || response.status === 403)
      throw new Error('Invalid API key for Gemini')
    if (response.status === 429) throw new Error('RATE_LIMIT')
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data: GeminiApiResponse = await response.json()
  const parts = data.candidates?.[0]?.content?.parts
  const textPart = Array.isArray(parts) ? parts.find((p) => !p.thought && p.text) : undefined
  if (!textPart?.text) throw new Error('Unexpected Gemini API response shape')
  return textPart.text.trim()
}

export class GeminiProvider implements AIProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string = 'gemini-2.5-flash-lite'
  ) {}

  async checkGrammar(
    text: string,
    language: string,
    uiLanguage: UiLocale
  ): Promise<GrammarError[]> {
    const raw = await callGemini(
      buildGrammarPrompt(text, language, uiLanguage),
      this.apiKey,
      this.model
    )
    return parseGrammarErrors(raw)
  }

  async rewrite(
    text: string,
    selection: string | undefined,
    language: string,
    tone?: TonePreset
  ): Promise<string> {
    const prompt = tone
      ? buildToneRewritePrompt(text, tone, language, selection)
      : buildRewritePrompt(text, selection, language)
    return callGemini(prompt, this.apiKey, this.model)
  }

  async translate(text: string, targetLanguage: string): Promise<string> {
    return callGemini(buildTranslatePrompt(text, targetLanguage), this.apiKey, this.model)
  }
}
