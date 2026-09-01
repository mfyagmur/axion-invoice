import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { profileApi } from '../api/profileApi'
import type { AccountUpdatePayload } from '@/types/auth'

export const useUpdateAccount = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  const pushToast = useToastStore((state) => state.push)
  const accessToken = useAuthStore((state) => state.accessToken)
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: AccountUpdatePayload) => profileApi.updateAccount(payload),
    onSuccess: (data) => {
      if (accessToken) {
        setAuth(data, accessToken)
      }
      pushToast('Hesap bilgileri güncellendi', 'success')
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 403) {
        pushToast(t('demo.actionBlocked'), 'error')
      } else {
        pushToast('Hesap bilgileri güncellenirken hata oluştu')
      }
    },
  })
}
