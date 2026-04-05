import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFieldDetector } from './useFieldDetector'

beforeEach(() => {
  vi.stubGlobal(
    'MutationObserver',
    class {
      observe() {}
      disconnect() {}
    }
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

function makeContentEditable(): HTMLElement {
  const div = document.createElement('div')
  div.setAttribute('contenteditable', 'true')
  document.body.appendChild(div)
  return div
}

describe('useFieldDetector', () => {
  it('returns null initially', () => {
    const { result } = renderHook(() => useFieldDetector())
    expect(result.current).toBeNull()
  })

  it('returns the focused contenteditable field on focusin', () => {
    const field = makeContentEditable()
    const { result } = renderHook(() => useFieldDetector())

    act(() => {
      field.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    })

    expect(result.current).toBe(field)
  })

  it('returns null after focusout to an unrelated element', () => {
    const field = makeContentEditable()
    const { result } = renderHook(() => useFieldDetector())

    act(() => {
      field.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    })
    expect(result.current).toBe(field)

    act(() => {
      field.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }))
    })
    expect(result.current).toBeNull()
  })

  it('keeps field active on focusout when isPanelElement returns true', () => {
    const field = makeContentEditable()
    const panelHost = document.createElement('div')
    document.body.appendChild(panelHost)

    const { result } = renderHook(() => useFieldDetector((el) => el === panelHost))

    act(() => {
      field.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    })
    act(() => {
      field.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: panelHost }))
    })

    expect(result.current).toBe(field)
  })

  it('switches to new field when another contenteditable gets focus', () => {
    const field1 = makeContentEditable()
    const field2 = makeContentEditable()
    const { result } = renderHook(() => useFieldDetector())

    act(() => {
      field1.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    })
    expect(result.current).toBe(field1)

    act(() => {
      field2.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    })
    expect(result.current).toBe(field2)
  })
})
