import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import tr from '@/i18n/locales/tr.json'
import en from '@/i18n/locales/en.json'

void i18next.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  lng: 'tr',
  fallbackLng: 'tr',
  interpolation: { escapeValue: false },
})

export default i18next
