import { describe, it, expect } from 'vitest'
import { LANGUAGE_OPTIONS } from './languages'

describe('LANGUAGE_OPTIONS', () => {
  const codes = LANGUAGE_OPTIONS.map((l) => l.code)

  it('includes zh-CN', () => expect(codes).toContain('zh-CN'))
  it('includes ar', () => expect(codes).toContain('ar'))
  it('includes fa', () => expect(codes).toContain('fa'))
  it('includes ja', () => expect(codes).toContain('ja'))
})
