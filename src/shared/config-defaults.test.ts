import { describe, it, expect } from 'vitest'
import { DEFAULT_CONFIG, mergeConfig } from './config-defaults'

describe('DEFAULT_CONFIG', () => {
  it('has activeProvider gemini', () => {
    expect(DEFAULT_CONFIG.activeProvider).toBe('gemini')
  })

  it('has 5 default providers', () => {
    expect(DEFAULT_CONFIG.providers).toHaveLength(5)
  })

  it('has auto language', () => {
    expect(DEFAULT_CONFIG.language).toBe('auto')
  })

  it('has empty disabledDomains', () => {
    expect(DEFAULT_CONFIG.disabledDomains).toEqual([])
  })
})

describe('mergeConfig', () => {
  it('returns defaults for empty object', () => {
    expect(mergeConfig({})).toEqual(DEFAULT_CONFIG)
  })

  it('overrides language', () => {
    const result = mergeConfig({ language: 'fr-FR' })
    expect(result.language).toBe('fr-FR')
    expect(result.activeProvider).toBe('gemini')
  })

  it('overrides providers array', () => {
    const providers = [{ id: 'gemini' as const, apiKey: 'AIza-test' }]
    const result = mergeConfig({ providers })
    expect(result.providers).toEqual(providers)
  })
})

describe('mergeConfig — providers merging', () => {
  it('keeps stored providers when present', () => {
    const result = mergeConfig({ providers: [{ id: 'gemini', apiKey: 'abc' }] })
    expect(result.providers).toEqual([{ id: 'gemini', apiKey: 'abc' }])
  })

  it('falls back to default providers when stored has none', () => {
    const result = mergeConfig({})
    expect(result.providers).toEqual(DEFAULT_CONFIG.providers)
  })

  it('does not lose providers when other top-level keys are missing', () => {
    const result = mergeConfig({ providers: [{ id: 'gemini', apiKey: 'xyz' }], language: 'fr-FR' })
    expect(result.providers[0].apiKey).toBe('xyz')
    expect(result.language).toBe('fr-FR')
    expect(result.disabledDomains).toEqual([])
  })
})

describe('DEFAULT_CONFIG providers', () => {
  it('contains a default entry for each of the 5 providers', () => {
    const ids = DEFAULT_CONFIG.providers.map((p) => p.id)
    expect(ids).toEqual(expect.arrayContaining(['gemini', 'claude', 'openai', 'ollama', 'mistral']))
    expect(ids).toHaveLength(5)
  })

  it('ollama default has baseUrl http://localhost:11434', () => {
    const ollama = DEFAULT_CONFIG.providers.find((p) => p.id === 'ollama')
    expect(ollama?.baseUrl).toBe('http://localhost:11434')
  })

  it('cloud providers have empty apiKey by default', () => {
    for (const id of ['gemini', 'claude', 'openai', 'mistral'] as const) {
      const p = DEFAULT_CONFIG.providers.find((pc) => pc.id === id)
      expect(p?.apiKey).toBe('')
    }
  })
})
