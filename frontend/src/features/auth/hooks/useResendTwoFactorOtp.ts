import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { authApi } from '@/features/auth/api/authApi'
import { useToastStore } from '@/store/toastStore'
import type { ResendTwoFactorPayload } from '@/types/auth'

export function useResendTwoFactorOtp() {
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (payload: ResendTwoFactorPayload) => authApi.resendTwoFactorOtp(payload),
    onSuccess: () => {
      pushToast('Yeni doğrulama kodu gönderildi', 'success', 8000)
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        const retryAfter = Number(error.response.headers['retry-after'])
        const seconds = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 30
        pushToast(`Çok sık deneme yaptınız, ${seconds} saniye sonra tekrar deneyin`, 'error', 8000)
        return
      }
      pushToast('Kod gönderilemedi, lütfen biraz sonra tekrar deneyin', 'error', 8000)
    },
  })
}
