import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '@/i18n/config'
import type { Locale } from '@/types/auth'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'tr',
      setLocale: (locale) => {
        void i18n.changeLanguage(locale)
        set({ locale })
      },
    }),
    { name: 'axion-locale-storage' },
  ),
)
