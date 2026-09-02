import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { twoFactorApi } from '../api/twoFactorApi'
import type { TwoFactorEmailConfirmPayload } from '@/types/auth'

export const useConfirmTwoFactorEmail = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  const accessToken = useAuthStore((state) => state.accessToken)
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (payload: TwoFactorEmailConfirmPayload) => twoFactorApi.confirmEmail(payload),
    onSuccess: (data) => {
      if (accessToken) {
        setAuth(data, accessToken)
      }
      pushToast('E-posta doğrulandı', 'success')
    },
    onError: () => {
      pushToast('Doğrulama kodu hatalı veya süresi dolmuş')
    },
  })
}
