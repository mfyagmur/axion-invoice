import { useMutation } from '@tanstack/react-query'
import { useToastStore } from '@/store/toastStore'
import { profileApi } from '../api/profileApi'
import type { PasswordChangePayload } from '@/types/auth'

export const useChangePassword = () => {
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (payload: PasswordChangePayload) => profileApi.changePassword(payload),
    onSuccess: () => {
      pushToast('Şifre başarıyla değiştirildi', 'success')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Şifre değiştirilirken hata oluştu'
      pushToast(message)
    },
  })
}
