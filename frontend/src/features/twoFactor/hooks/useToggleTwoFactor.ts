import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { twoFactorApi } from '../api/twoFactorApi'
import type { TwoFactorTogglePayload } from '@/types/auth'

export const useToggleTwoFactor = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  const accessToken = useAuthStore((state) => state.accessToken)
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (payload: TwoFactorTogglePayload) => twoFactorApi.toggle(payload),
    onSuccess: (data) => {
      if (accessToken) {
        setAuth(data, accessToken)
      }
    },
    onError: () => {
      pushToast('İki adımlı doğrulama güncellenirken hata oluştu')
    },
  })
}
