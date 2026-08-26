import { useMutation } from '@tanstack/react-query'
import { useToastStore } from '@/store/toastStore'
import { templatesApi } from '../api/templatesApi'

export const useUploadTemplateAsset = () => {
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (file: File) => templatesApi.uploadAsset(file),
    onError: () => {
      pushToast('Görsel yüklenirken hata oluştu')
    },
  })
}
