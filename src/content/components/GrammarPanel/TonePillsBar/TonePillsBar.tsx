import { useTranslation } from 'react-i18next'
import { TonePreset } from '../../../../shared/types'

interface TonePillsBarProps {
  onSelectTone: (tone: TonePreset) => void
}

const TONES: TonePreset[] = ['shorter', 'formal', 'direct', 'technical']

export function TonePillsBar({ onSelectTone }: TonePillsBarProps) {
  const { t } = useTranslation()
  return (
    <div className="tone-bar">
      {TONES.map((tone) => (
        <button
          key={tone}
          className="btn-tone"
          data-tone={tone}
          onClick={() => onSelectTone(tone)}
        >
          {t(`tone.${tone}`)}
        </button>
      ))}
    </div>
  )
}
