import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { profileApi } from '../api/profileApi'

export const useRemoveLogo = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  const pushToast = useToastStore((state) => state.push)
  const accessToken = useAuthStore((state) => state.accessToken)

  return useMutation({
    mutationFn: () => profileApi.removeLogo(),
    onSuccess: (data) => {
      if (accessToken) {
        setAuth(data, accessToken)
      }
      pushToast('Logo kaldırıldı', 'success')
    },
    onError: () => {
      pushToast('Logo kaldırılırken hata oluştu')
    },
  })
}
