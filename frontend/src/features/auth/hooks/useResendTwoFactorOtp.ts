import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/features/auth/api/authApi'
import { useToastStore } from '@/store/toastStore'
import type { ResendTwoFactorPayload } from '@/types/auth'

export function useResendTwoFactorOtp() {
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (payload: ResendTwoFactorPayload) => authApi.resendTwoFactorOtp(payload),
    onSuccess: () => {
      pushToast('Yeni doğrulama kodu gönderildi', 'success')
    },
    onError: () => {
      pushToast('Kod gönderilemedi, lütfen biraz sonra tekrar deneyin')
    },
  })
}
