import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sendBackgroundMessage } from './messaging'

function stubChrome(sendMessage: () => unknown) {
  vi.stubGlobal('chrome', {
    runtime: { id: 'test-ext', sendMessage: vi.fn().mockImplementation(sendMessage) },
  })
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const msg = {
  type: 'CHECK_GRAMMAR' as const,
  text: 'hi',
  language: 'en',
  uiLanguage: 'en' as const,
}

describe('sendBackgroundMessage', () => {
  it('resolves with response on success', async () => {
    stubChrome(() => Promise.resolve({ errors: [] }))
    const result = await sendBackgroundMessage(msg)
    expect(result).toEqual({ errors: [] })
  })

  it('throws EXTENSION_INVALIDATED when chrome.runtime.id is falsy', async () => {
    vi.stubGlobal('chrome', { runtime: { id: '' } })
    await expect(sendBackgroundMessage(msg)).rejects.toThrow(
      'Extension updated — please refresh the page'
    )
  })

  it('throws "Request timed out" after 45s', async () => {
    stubChrome(() => new Promise(() => {}))
    const promise = sendBackgroundMessage(msg).catch((e) => {
      throw e
    })
    const [, rejection] = await Promise.allSettled([vi.advanceTimersByTimeAsync(45000), promise])
    expect((rejection as PromiseRejectedResult).reason?.message).toBe('Request timed out')
  })

  it('throws EXTENSION_INVALIDATED when sendMessage throws', async () => {
    stubChrome(() => Promise.reject(new Error('Extension context invalidated')))
    await expect(sendBackgroundMessage(msg)).rejects.toThrow(
      'Extension updated — please refresh the page'
    )
  })

  it('throws EXTENSION_ERROR when response is null/undefined', async () => {
    stubChrome(() => Promise.resolve(null))
    await expect(sendBackgroundMessage(msg)).rejects.toThrow('Extension error')
  })

  it('throws with error message when response has error field', async () => {
    stubChrome(() => Promise.resolve({ error: 'RATE_LIMIT' }))
    await expect(sendBackgroundMessage(msg)).rejects.toThrow('RATE_LIMIT')
  })
})
