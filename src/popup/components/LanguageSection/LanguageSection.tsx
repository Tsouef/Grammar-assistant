import { useTranslation } from 'react-i18next'
import type { Config } from '../../../shared/types'
import { LANGUAGE_OPTIONS } from '../../../shared/languages'

interface LanguageSectionProps {
  value: Config['language']
  onChange: (value: Config['language']) => void
}

export function LanguageSection({ value, onChange }: LanguageSectionProps) {
  const { t } = useTranslation()
  return (
    <div className="section">
      <label className="label" htmlFor="language">
        {t('popup.textLanguage')}
      </label>
      <select
        id="language"
        value={value}
        onChange={(e) => onChange(e.target.value as Config['language'])}
      >
        <option value="auto">{t('popup.autoDetect')}</option>
        {LANGUAGE_OPTIONS.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
