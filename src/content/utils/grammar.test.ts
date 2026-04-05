import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createGrammarChecker } from './grammar'
import { sendBackgroundMessage } from './messaging'

vi.mock('./messaging', () => ({
  sendBackgroundMessage: vi.fn(),
}))

const mockSend = vi.mocked(sendBackgroundMessage)

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('chrome', {
    runtime: { id: 'test-extension-id' },
  })
  mockSend.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('createGrammarChecker', () => {
  it('does not call sendBackgroundMessage before 600ms', () => {
    const { check } = createGrammarChecker('en-US', 'en', vi.fn(), vi.fn())
    check('Hello world')
    vi.advanceTimersByTime(599)
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('calls sendBackgroundMessage after 600ms debounce', async () => {
    mockSend.mockResolvedValue({ errors: [] })
    const { check } = createGrammarChecker('en-US', 'en', vi.fn(), vi.fn())
    check('Hello world')
    await vi.advanceTimersByTimeAsync(600)
    expect(mockSend).toHaveBeenCalledWith({
      type: 'CHECK_GRAMMAR',
      text: 'Hello world',
      language: 'en-US',
      uiLanguage: 'en',
    })
  })

  it('resets timer on rapid input — only sends once', async () => {
    mockSend.mockResolvedValue({ errors: [] })
    const { check } = createGrammarChecker('en-US', 'en', vi.fn(), vi.fn())
    check('H')
    vi.advanceTimersByTime(300)
    check('He')
    vi.advanceTimersByTime(300)
    check('Hello')
    vi.advanceTimersByTime(300)
    expect(mockSend).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(300)
    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ text: 'Hello' }))
  })

  it('calls onResults with parsed errors AND the original text', async () => {
    const onResults = vi.fn()
    const errors = [
      { original: 'are', replacement: 'is', message: 'SVA', context: 'data are wrong' },
    ]
    mockSend.mockResolvedValue({ errors })
    const { check } = createGrammarChecker('en-US', 'en', onResults, vi.fn())
    check('This are wrong')
    await vi.advanceTimersByTimeAsync(600)
    expect(onResults).toHaveBeenCalledWith(errors, 'This are wrong')
  })

  it('calls onResults with empty array for blank text without sending', () => {
    const onResults = vi.fn()
    const { check } = createGrammarChecker('en-US', 'en', onResults, vi.fn())
    check('   ')
    vi.advanceTimersByTime(600)
    expect(mockSend).not.toHaveBeenCalled()
    expect(onResults).toHaveBeenCalledWith([], '   ')
  })

  it('calls onError with "Request timed out" if sendBackgroundMessage rejects', async () => {
    const onError = vi.fn()
    mockSend.mockRejectedValue(new Error('Request timed out'))
    const { check } = createGrammarChecker('en-US', 'en', vi.fn(), onError)
    check('Hello world')
    await vi.advanceTimersByTimeAsync(600)
    expect(onError).toHaveBeenCalledWith('Request timed out')
  })

  it('applies 5s backoff after RATE_LIMIT error', async () => {
    mockSend.mockRejectedValueOnce(new Error('RATE_LIMIT'))
    const onError = vi.fn()
    const { check } = createGrammarChecker('en-US', 'en', vi.fn(), onError)
    check('text')
    await vi.advanceTimersByTimeAsync(600)
    expect(onError).toHaveBeenCalledWith('Rate limit — please wait a moment')

    mockSend.mockResolvedValue({ errors: [] })
    check('text again')
    vi.advanceTimersByTime(600)
    expect(mockSend).toHaveBeenCalledTimes(1) // still just the first call

    vi.advanceTimersByTime(4400 + 600)
    check('text after backoff')
    await vi.advanceTimersByTimeAsync(600)
    expect(mockSend).toHaveBeenCalledTimes(2)
  })
})
