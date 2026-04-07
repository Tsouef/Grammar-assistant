import { describe, it, expect } from 'vitest'
import { RTL_LOCALES } from './i18n'

describe('RTL_LOCALES', () => {
  it('includes ar', () => expect(RTL_LOCALES.has('ar')).toBe(true))
  it('includes fa', () => expect(RTL_LOCALES.has('fa')).toBe(true))
  it('does not include en', () => expect(RTL_LOCALES.has('en')).toBe(false))
  it('does not include zh', () => expect(RTL_LOCALES.has('zh')).toBe(false))
  it('does not include ja', () => expect(RTL_LOCALES.has('ja')).toBe(false))
})
