import styles from './ProviderSection.module.css'
import type { ProviderId } from '../../../shared/types'
import { PROVIDER_MODELS, PROVIDER_LABELS, API_KEY_LABELS, PROVIDER_IDS } from '../../../shared/models'

export type PerProviderState = { apiKey: string; model: string; baseUrl: string }

interface ProviderSectionErrors {
  apiKey?: boolean
  baseUrl?: boolean
  model?: boolean
}

interface ProviderSectionProps {
  activeProvider: ProviderId
  providerStates: Record<ProviderId, PerProviderState>
  onProviderChange: (id: ProviderId) => void
  onStateChange: (id: ProviderId, patch: Partial<PerProviderState>) => void
  errors: ProviderSectionErrors
  ollamaModels: string[]
  ollamaModelsStatus: 'idle' | 'loading' | 'error'
}

export function ProviderSection({
  activeProvider,
  providerStates,
  onProviderChange,
  onStateChange,
  errors,
  ollamaModels,
  ollamaModelsStatus,
}: ProviderSectionProps) {
  const state = providerStates[activeProvider]
  const isOllama = activeProvider === 'ollama'

  return (
    <div className="section">
      {/* Provider selector */}
      <label className="label" htmlFor="provider-select">Provider</label>
      <select
        id="provider-select"
        value={activeProvider}
        onChange={(e) => onProviderChange(e.target.value as ProviderId)}
      >
        {PROVIDER_IDS.map((id) => (
          <option key={id} value={id}>{PROVIDER_LABELS[id]}</option>
        ))}
      </select>

      {/* API key — cloud providers only */}
      {!isOllama && (
        <div className={styles.field}>
          <label className="label" htmlFor="api-key">
            {API_KEY_LABELS[activeProvider as Exclude<ProviderId, 'ollama'>]}
          </label>
          <div className={styles.inputRow}>
            <input
              type="password"
              id="api-key"
              autoComplete="off"
              value={state.apiKey}
              onChange={(e) => onStateChange(activeProvider, { apiKey: e.target.value })}
            />
          </div>
          {errors.apiKey && <p className={styles.errorMsg}>API key required</p>}
        </div>
      )}

      {/* Base URL — Ollama only */}
      {isOllama && (
        <div className={styles.field}>
          <label className="label" htmlFor="base-url">Base URL</label>
          <input
            type="text"
            id="base-url"
            placeholder="http://localhost:11434"
            value={state.baseUrl}
            onChange={(e) => onStateChange('ollama', { baseUrl: e.target.value })}
          />
          {errors.baseUrl && <p className={styles.errorMsg}>Base URL required</p>}
        </div>
      )}

      {/* Model selector */}
      <div className={styles.field}>
        <label className="label" htmlFor="model-select">Model</label>
        {isOllama ? (
          ollamaModelsStatus === 'loading' ? (
            <p className={styles.statusMsg}>Loading models…</p>
          ) : ollamaModelsStatus === 'error' ? (
            <p className={styles.errorMsg}>Ollama unreachable — is the server running?</p>
          ) : (
            <>
              <select
                id="model-select"
                value={state.model}
                onChange={(e) => onStateChange('ollama', { model: e.target.value })}
              >
                {!state.model && <option value="">— select a model —</option>}
                {ollamaModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {errors.model && <p className={styles.errorMsg}>Model required</p>}
            </>
          )
        ) : (
          <select
            id="model-select"
            value={state.model || PROVIDER_MODELS[activeProvider as Exclude<ProviderId, 'ollama'>][0]}
            onChange={(e) => onStateChange(activeProvider, { model: e.target.value })}
          >
            {PROVIDER_MODELS[activeProvider as Exclude<ProviderId, 'ollama'>].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}
