import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { profileApi } from '../api/profileApi'

export const useUploadLogo = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  const pushToast = useToastStore((state) => state.push)
  const accessToken = useAuthStore((state) => state.accessToken)

  return useMutation({
    mutationFn: (file: File) => profileApi.uploadLogo(file),
    onSuccess: (data) => {
      if (accessToken) {
        setAuth(data, accessToken)
      }
      pushToast('Logo başarıyla yüklendi', 'success')
    },
    onError: () => {
      pushToast('Logo yüklenirken hata oluştu')
    },
  })
}
