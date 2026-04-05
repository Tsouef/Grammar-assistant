import { useTranslation } from 'react-i18next'
import type { UiLocale } from '../../../shared/types'

const UI_LANGUAGE_OPTIONS: { code: UiLocale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'nl', label: 'Nederlands' },
]

interface UiLanguageSectionProps {
  value: UiLocale
  onChange: (value: UiLocale) => void
}

export function UiLanguageSection({ value, onChange }: UiLanguageSectionProps) {
  const { t } = useTranslation()
  return (
    <div className="section">
      <label className="label" htmlFor="ui-language">
        {t('popup.uiLanguage')}
      </label>
      <select id="ui-language" value={value} onChange={(e) => onChange(e.target.value as UiLocale)}>
        {UI_LANGUAGE_OPTIONS.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
