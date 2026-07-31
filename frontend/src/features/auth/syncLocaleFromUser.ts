import { useLocaleStore } from '@/store/localeStore'
import type { User } from '@/types/auth'

export function syncLocaleFromUser(user: User): void {
  const { locale, setLocale } = useLocaleStore.getState()
  if (user.locale !== locale) {
    setLocale(user.locale)
  }
}
