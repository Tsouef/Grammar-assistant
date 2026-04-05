import { type KeyboardEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './DisabledSitesSection.module.css'
import { DomainTag } from '../DomainTag/DomainTag'

interface DisabledSitesSectionProps {
  domains: string[]
  onAdd: (domain: string) => void
  onRemove: (domain: string) => void
}

export function DisabledSitesSection({ domains, onAdd, onRemove }: DisabledSitesSectionProps) {
  const { t } = useTranslation()
  const [inputValue, setInputValue] = useState('')

  function handleAdd() {
    const domain = inputValue.trim().toLowerCase()
    if (domain && !domains.includes(domain)) {
      onAdd(domain)
      setInputValue('')
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="section">
      <span className="label">{t('popup.disabledSites')}</span>
      <div className={styles.domainTags}>
        {domains.map((domain) => (
          <DomainTag key={domain} domain={domain} onRemove={() => onRemove(domain)} />
        ))}
      </div>
      <div className={styles.inputGroup}>
        <input
          type="text"
          placeholder="example.com"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className={styles.addBtn} onClick={handleAdd}>
          {t('popup.addBtn')}
        </button>
      </div>
    </div>
  )
}
