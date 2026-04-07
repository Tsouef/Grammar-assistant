import { describe, it, expect } from 'vitest'
import { anonymizePii } from './pii'

function anon(text: string): string {
  return anonymizePii(text).anonymized
}

function roundtrip(text: string): string {
  const { anonymized, restore } = anonymizePii(text)
  return restore(anonymized)
}

describe('anonymizePii', () => {
  it('replaces email addresses', () => {
    expect(anon('Contact me at john@example.com please')).not.toContain('john@example.com')
    expect(anon('Contact me at john@example.com please')).toContain('Contact me at')
    expect(anon('Contact me at john@example.com please')).toContain('please')
  })

  it('replaces multiple emails in one string', () => {
    const result = anon('Email john@example.com or jane@corp.io')
    expect(result).not.toContain('john@example.com')
    expect(result).not.toContain('jane@corp.io')
  })

  it('replaces North-American phone (dashes)', () => {
    expect(anon('Call 555-123-4567 tomorrow')).not.toContain('555-123-4567')
  })

  it('replaces North-American phone (dots)', () => {
    expect(anon('Call 555.123.4567 tomorrow')).not.toContain('555.123.4567')
  })

  it('replaces North-American phone with country code', () => {
    expect(anon('Call +1-555-123-4567')).not.toContain('+1-555-123-4567')
  })

  it('replaces international phone', () => {
    expect(anon('Call +33 6 12 34 56 78 tomorrow')).not.toContain('+33')
  })

  it('replaces both email and phone in one string', () => {
    const result = anon('Email john@example.com or call 555-123-4567')
    expect(result).not.toContain('john@example.com')
    expect(result).not.toContain('555-123-4567')
  })

  it('replaces French mobile (no separators)', () => {
    expect(anon('Mon numéro est 0633067986 merci')).not.toContain('0633067986')
  })

  it('replaces French mobile (spaces)', () => {
    expect(anon('Appelez le 06 33 06 79 86')).not.toContain('06 33 06 79 86')
  })

  it('replaces French landline (dots)', () => {
    expect(anon('Tel: 01.23.45.67.89')).not.toContain('01.23.45.67.89')
  })

  it('does not match short numbers that are not phone numbers', () => {
    expect(anon('Room 123 or floor 4567')).toBe('Room 123 or floor 4567')
  })

  it('does not alter plain text with no PII', () => {
    expect(anon('The dog ate 3 apples in 2025')).toBe('The dog ate 3 apples in 2025')
  })

  it('returns empty string unchanged', () => {
    expect(anon('')).toBe('')
  })

  it('restore returns original text', () => {
    expect(roundtrip('Email john@example.com or call 555-123-4567')).toBe(
      'Email john@example.com or call 555-123-4567'
    )
  })

  it('restore works in error contexts spanning PII', () => {
    const text = 'Call 0633067986 for info'
    const { anonymized, restore } = anonymizePii(text)
    // Simulate an AI error context that contains the token
    expect(restore(anonymized)).toBe(text)
    // Partial context containing the token should also restore correctly
    const token = anonymized.replace('Call ', '').replace(' for info', '')
    expect(restore(`Call ${token} for info`)).toBe('Call 0633067986 for info')
  })
})
