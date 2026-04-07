import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { UiLocale } from '../types'
import en from './locales/en.json'
import enGB from './locales/en-GB.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import es from './locales/es.json'
import nl from './locales/nl.json'
import zh from './locales/zh.json'
import ar from './locales/ar.json'
import fa from './locales/fa.json'
import ja from './locales/ja.json'
import ptPT from './locales/pt-PT.json'
import ptBR from './locales/pt-BR.json'

export const RTL_LOCALES: ReadonlySet<UiLocale> = new Set(['ar', 'fa'])

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'en-GB': { translation: { ...en, ...enGB } },
    fr: { translation: fr },
    de: { translation: de },
    es: { translation: es },
    nl: { translation: nl },
    zh: { translation: zh },
    ar: { translation: ar },
    fa: { translation: fa },
    ja: { translation: ja },
    'pt-PT': { translation: ptPT },
    'pt-BR': { translation: ptBR },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React handles XSS escaping
  },
})

export default i18n
