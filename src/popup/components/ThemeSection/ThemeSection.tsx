import { useTranslation } from 'react-i18next'
import type { UiTheme } from '../../../shared/types'
import styles from './ThemeSection.module.css'

interface ThemeSectionProps {
  value: UiTheme
  onChange: (theme: UiTheme) => void
}

export function ThemeSection({ value, onChange }: ThemeSectionProps) {
  const { t } = useTranslation()
  return (
    <div className="section">
      <span className="label">{t('popup.uiTheme')}</span>
      <div className={styles.group} role="group">
        <button
          type="button"
          className={`${styles.btn}${value === 'dark' ? ` ${styles.active}` : ''}`}
          onClick={() => onChange('dark')}
        >
          <span className={styles.icon}>🌙</span>
          {t('popup.themeDark')}
        </button>
        <button
          type="button"
          className={`${styles.btn}${value === 'light' ? ` ${styles.active}` : ''}`}
          onClick={() => onChange('light')}
        >
          <span className={styles.icon}>☀️</span>
          {t('popup.themeLight')}
        </button>
      </div>
    </div>
  )
}
