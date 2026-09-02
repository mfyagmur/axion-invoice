import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { twoFactorApi } from '../api/twoFactorApi'
import type { TwoFactorEmailSetupPayload } from '@/types/auth'

export const useSetupTwoFactorEmail = () => {
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const setAuth = useAuthStore((state) => state.setAuth)
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (payload: TwoFactorEmailSetupPayload) => twoFactorApi.setupEmail(payload),
    onSuccess: (_data, variables) => {
      if (user && accessToken) {
        setAuth({ ...user, two_factor_pending_email: variables.email }, accessToken)
      }
      pushToast('Doğrulama kodu gönderildi', 'success')
    },
    onError: () => {
      pushToast('Doğrulama kodu gönderilirken hata oluştu')
    },
  })
}
