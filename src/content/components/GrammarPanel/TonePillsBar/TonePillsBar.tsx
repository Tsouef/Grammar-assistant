import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TonePreset } from '../../../../shared/types'

interface TonePillsBarProps {
  onSelectTone: (tone: TonePreset) => void
}

const TONES: TonePreset[] = ['shorter', 'formal', 'direct', 'technical']

export function TonePillsBar({ onSelectTone }: TonePillsBarProps) {
  const { t } = useTranslation()
  const [activeTone, setActiveTone] = useState<TonePreset | null>(null)

  function handleSelect(tone: TonePreset) {
    setActiveTone(tone)
    onSelectTone(tone)
  }

  return (
    <div className="tone-bar">
      {TONES.map((tone) => (
        <button
          key={tone}
          className="btn-tone"
          data-tone={tone}
          aria-pressed={activeTone === tone}
          onClick={() => handleSelect(tone)}
        >
          {t(`tone.${tone}`)}
        </button>
      ))}
    </div>
  )
}
