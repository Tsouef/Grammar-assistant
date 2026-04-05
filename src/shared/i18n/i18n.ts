import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import enGB from './locales/en-GB.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import es from './locales/es.json'
import nl from './locales/nl.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'en-GB': { translation: { ...en, ...enGB } },
    fr: { translation: fr },
    de: { translation: de },
    es: { translation: es },
    nl: { translation: nl },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React handles XSS escaping
  },
})

export default i18n
