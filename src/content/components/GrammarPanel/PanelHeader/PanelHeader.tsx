import { TonePreset } from '../../../../shared/types'
import { PanelState } from '../../../hooks/usePanelState'
import { Spinner } from '../Spinner/Spinner'

interface PanelHeaderProps {
  state: PanelState
  onRequestAI: (tone?: TonePreset) => void
  onOpenSettings?: () => void
}

export function PanelHeader({ state, onRequestAI, onOpenSettings }: PanelHeaderProps) {
  function renderStatus() {
    if (state.type === 'checking') {
      return (
        <span className="status">
          <Spinner />
          Checking&hellip;
        </span>
      )
    }

    if (state.type === 'error') {
      const isNoProvider = state.message === 'NO_PROVIDER_CONFIGURED'
      const msg = isNoProvider
        ? 'Configure a provider in settings'
        : state.message.includes('Invalid API key')
        ? state.message
        : state.message.includes('unreachable')
        ? 'AI service unreachable'
        : state.message
      return (
        <span className="status">
          <span className="status-icon error">⚠</span>
          {msg}
          {isNoProvider && onOpenSettings && (
            <button className="btn-open-settings" onClick={onOpenSettings}>
              Open settings
            </button>
          )}
        </span>
      )
    }

    if (state.type === 'translating') {
      return (
        <span className="status">
          <Spinner />
          Translating&hellip;
        </span>
      )
    }

    if (state.type === 'ai-rewriting') {
      return (
        <span className="status">
          <Spinner />
          Rewriting&hellip;
        </span>
      )
    }

    if (state.type === 'translate-result') {
      return (
        <span className="status">
          <span className="status-icon info">✦</span>
          Translation
        </span>
      )
    }

    if (state.type === 'ai-result') {
      return (
        <span className="status">
          <span className="status-icon info">✦</span>
          AI suggestion
        </span>
      )
    }

    if (state.type === 'results') {
      if (state.errors.length === 0) {
        return <span className="status">✅ Looks good</span>
      }
      return (
        <span className="status">
          <span className="status-icon warning">●</span>
          {` ${state.errors.length} issue${state.errors.length > 1 ? 's' : ''}`}
        </span>
      )
    }

    return null
  }

  const showImproveButton = state.type === 'results'

  return (
    <div className="header">
      {renderStatus()}
      {showImproveButton && (
        <button className="btn-improve" onClick={() => onRequestAI(undefined)}>
          ✦ Improve
        </button>
      )}
    </div>
  )
}
