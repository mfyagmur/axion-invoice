import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import {
  formatDate,
  formatDateVerbal,
  normalizeDateFormat,
  type VerbalDateOptions,
} from '@/utils/dateFormat'

export function useDateFormat() {
  const rawPattern = useAuthStore((s) => s.user?.date_format)
  const pattern = normalizeDateFormat(rawPattern)
  const { i18n } = useTranslation()
  const locale: 'tr' | 'en' = i18n.language?.startsWith('en') ? 'en' : 'tr'

  return {
    pattern,
    locale,
    formatDate: useCallback(
      (date: Parameters<typeof formatDate>[0]) => formatDate(date, pattern),
      [pattern],
    ),
    formatDateVerbal: useCallback(
      (date: Parameters<typeof formatDateVerbal>[0], options?: VerbalDateOptions) =>
        formatDateVerbal(date, pattern, locale, options),
      [pattern, locale],
    ),
  }
}
