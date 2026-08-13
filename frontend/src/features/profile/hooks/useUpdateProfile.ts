import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { profileApi } from '../api/profileApi'
import type { ProfileUpdatePayload } from '@/types/auth'

export const useUpdateProfile = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  const pushToast = useToastStore((state) => state.push)
  const accessToken = useAuthStore((state) => state.accessToken)

  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => profileApi.updateProfile(payload),
    onSuccess: (data) => {
      if (accessToken) {
        setAuth(data, accessToken)
      }
      pushToast('Profil güncellendi', 'success')
    },
    onError: () => {
      pushToast('Profil güncellenirken hata oluştu')
    },
  })
}
