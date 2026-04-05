import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import styles from './SaveButton.module.css'

interface SaveButtonProps {
  onClick: () => void
}

export function SaveButton({ onClick }: SaveButtonProps) {
  const { t } = useTranslation()
  return (
    <motion.button
      className={styles.btnSave}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
    >
      {t('popup.save')}
    </motion.button>
  )
}
