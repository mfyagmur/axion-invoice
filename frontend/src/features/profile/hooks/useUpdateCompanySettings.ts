import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { profileApi } from '../api/profileApi'
import type { CompanySettingsUpdatePayload } from '@/types/auth'

export const useUpdateCompanySettings = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  const pushToast = useToastStore((state) => state.push)
  const accessToken = useAuthStore((state) => state.accessToken)

  return useMutation({
    mutationFn: (payload: CompanySettingsUpdatePayload) => profileApi.updateCompanySettings(payload),
    onSuccess: (data) => {
      if (accessToken) {
        setAuth(data, accessToken)
      }
      pushToast('Ayarlar kaydedildi', 'success')
    },
    onError: () => {
      pushToast('Ayarlar kaydedilirken hata oluştu')
    },
  })
}
