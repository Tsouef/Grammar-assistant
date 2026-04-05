// Regression: ISSUE-001 — Popup crashes silently when chrome.runtime.sendMessage returns
// a response without a `models` field (e.g., malformed background response or service
// worker not yet initialized). setOllamaModels(undefined) caused .map() to throw, which
// unmounted the entire React tree with no visible error.
// Found by /qa on 2026-04-05
// Report: .gstack/qa-reports/

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'

// Minimal chrome mock — deliberately returns no `models` field to reproduce the bug
const mockSendMessage = vi.fn()
vi.stubGlobal('chrome', {
  storage: {
    local: {
      get: vi.fn().mockImplementation((keys, cb) => {
        const defaults = typeof keys === 'object' && !Array.isArray(keys) ? keys : {}
        cb?.(defaults)
        return Promise.resolve(defaults)
      }),
      set: vi.fn().mockImplementation((_, cb) => {
        cb?.()
        return Promise.resolve()
      }),
    },
    sync: {
      get: vi.fn().mockImplementation((_, cb) => {
        cb?.({})
        return Promise.resolve({})
      }),
      set: vi.fn().mockImplementation((_, cb) => {
        cb?.()
        return Promise.resolve()
      }),
    },
    onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
  },
  runtime: {
    sendMessage: mockSendMessage,
    onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
    lastError: null,
    id: 'test-id',
  },
})

describe('App — Ollama provider null guard regression (ISSUE-001)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing when sendMessage returns no models field', async () => {
    // Precondition: background returns {} (no models property) — the exact state that triggered the bug
    mockSendMessage.mockResolvedValue({})

    const { default: App } = await import('./App')

    await act(async () => {
      render(<App />)
    })

    // If the null guard is absent, React tree crashes and root renders empty
    // Verify the app is still mounted by checking a known element
    expect(screen.getByRole('combobox', { name: /provider/i })).toBeInTheDocument()
  })

  it('renders without crashing when sendMessage returns null models', async () => {
    mockSendMessage.mockResolvedValue({ models: null })

    const { default: App } = await import('./App')

    await act(async () => {
      render(<App />)
    })

    expect(screen.getByRole('combobox', { name: /provider/i })).toBeInTheDocument()
  })
})
