import type { ProviderId } from './types'

export const PROVIDER_IDS: ProviderId[] = ['gemini', 'claude', 'openai', 'mistral', 'ollama']

export const PROVIDER_MODELS: Record<Exclude<ProviderId, 'ollama'>, string[]> = {
  gemini: ['gemini-2.5-flash-lite', 'gemini-2.5-flash'],
  claude: ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-opus-4-6'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'],
  mistral: ['mistral-small-latest', 'mistral-medium-latest', 'mistral-large-latest'],
}

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  gemini: 'Gemini',
  claude: 'Claude (Anthropic)',
  openai: 'ChatGPT (OpenAI)',
  ollama: 'Ollama (local)',
  mistral: 'Mistral',
}

export const API_KEY_LABELS: Record<Exclude<ProviderId, 'ollama'>, string> = {
  gemini: 'Gemini API key',
  claude: 'Anthropic API key',
  openai: 'OpenAI API key',
  mistral: 'Mistral API key',
}
