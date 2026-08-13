import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import tr from '@/i18n/locales/tr.json'
import en from '@/i18n/locales/en.json'

function getPersistedLocale(): 'tr' | 'en' {
  try {
    const raw = localStorage.getItem('axion-locale-storage')
    const locale = raw ? JSON.parse(raw)?.state?.locale : null
    return locale === 'en' ? 'en' : 'tr'
  } catch {
    return 'tr'
  }
}

void i18next.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  lng: getPersistedLocale(),
  fallbackLng: 'tr',
  interpolation: { escapeValue: false },
})

export default i18next
