import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { profileApi } from '../api/profileApi'
import type { AccountUpdatePayload } from '@/types/auth'

export const useUpdateAccount = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  const pushToast = useToastStore((state) => state.push)
  const accessToken = useAuthStore((state) => state.accessToken)

  return useMutation({
    mutationFn: (payload: AccountUpdatePayload) => profileApi.updateAccount(payload),
    onSuccess: (data) => {
      if (accessToken) {
        setAuth(data, accessToken)
      }
      pushToast('Hesap bilgileri güncellendi', 'success')
    },
    onError: () => {
      pushToast('Hesap bilgileri güncellenirken hata oluştu')
    },
  })
}
