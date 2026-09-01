import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { profileApi } from '../api/profileApi'

export const useRemoveLogo = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  const pushToast = useToastStore((state) => state.push)
  const accessToken = useAuthStore((state) => state.accessToken)
  const { t } = useTranslation()

  return useMutation({
    mutationFn: () => profileApi.removeLogo(),
    onSuccess: (data) => {
      if (accessToken) {
        setAuth(data, accessToken)
      }
      pushToast('Logo kaldırıldı', 'success')
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 403) {
        pushToast(t('demo.actionBlocked'), 'error')
      } else {
        pushToast('Logo kaldırılırken hata oluştu')
      }
    },
  })
}
