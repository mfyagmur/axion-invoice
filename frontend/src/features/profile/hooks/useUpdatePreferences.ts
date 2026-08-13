import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useLocaleStore } from '@/store/localeStore'
import { useToastStore } from '@/store/toastStore'
import { profileApi } from '../api/profileApi'
import type { PreferencesUpdatePayload } from '@/types/auth'

export const useUpdatePreferences = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  const setLocale = useLocaleStore((state) => state.setLocale)
  const pushToast = useToastStore((state) => state.push)
  const accessToken = useAuthStore((state) => state.accessToken)

  return useMutation({
    mutationFn: (payload: PreferencesUpdatePayload) => profileApi.updatePreferences(payload),
    onSuccess: (data) => {
      if (accessToken) {
        setAuth(data, accessToken)
      }
      if (data.locale) {
        setLocale(data.locale)
      }
      pushToast('Tercihler güncellendi', 'success')
    },
    onError: () => {
      pushToast('Tercihler güncellenirken hata oluştu')
    },
  })
}
