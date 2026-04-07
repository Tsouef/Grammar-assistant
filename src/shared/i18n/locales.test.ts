import { describe, it, expect } from 'vitest'
import en from './locales/en.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import es from './locales/es.json'
import nl from './locales/nl.json'
import zh from './locales/zh.json'
import ar from './locales/ar.json'
import fa from './locales/fa.json'
import ja from './locales/ja.json'
import ptPT from './locales/pt-PT.json'
import ptBR from './locales/pt-BR.json'

function flatKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null
      ? flatKeys(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  )
}

const enKeys = flatKeys(en as Record<string, unknown>)

const locales: Record<string, unknown> = {
  fr,
  de,
  es,
  nl,
  zh,
  ar,
  fa,
  ja,
  'pt-PT': ptPT,
  'pt-BR': ptBR,
}

describe('locale completeness', () => {
  for (const [name, locale] of Object.entries(locales)) {
    it(`${name} has all keys from en`, () => {
      const keys = flatKeys(locale as Record<string, unknown>)
      for (const key of enKeys) {
        expect(keys, `${name} is missing key: ${key}`).toContain(key)
      }
    })
  }
})
