import { describe, it, expect, beforeEach, vi } from 'vitest'
import { applyAI } from './text-apply'

// jsdom does not implement execCommand — return false so the fallback (textContent) is used
Object.defineProperty(document, 'execCommand', {
  value: vi.fn().mockReturnValue(false),
  writable: true,
})

function makeContentEditable(content: string): HTMLDivElement {
  const el = document.createElement('div')
  el.contentEditable = 'true'
  el.textContent = content
  document.body.appendChild(el)
  return el
}

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('applyAI', () => {
  it('replaces full field text when isSelection is false', () => {
    const el = makeContentEditable('original text')
    applyAI(el, 'rewritten text', false)
    expect(el.textContent).toBe('rewritten text')
  })

  it('focuses the field when applying', () => {
    const el = makeContentEditable('text')
    const focusSpy = vi.spyOn(el, 'focus')
    applyAI(el, 'new text', false)
    expect(focusSpy).toHaveBeenCalled()
  })

  it('handles empty replacement', () => {
    const el = makeContentEditable('some text')
    applyAI(el, '', false)
    expect(el.textContent).toBe('')
  })
})
