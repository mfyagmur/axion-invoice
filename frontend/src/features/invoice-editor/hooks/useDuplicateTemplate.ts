import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getTemplateErrorKey } from '@/features/invoice-editor/getTemplateErrorKey'
import { templatesApi } from '@/features/invoice-editor/api/templatesApi'
import { useToastStore } from '@/store/toastStore'

export function useDuplicateTemplate() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (id: string) => templatesApi.duplicate(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['templates'] })
      navigate(`/dashboard/templates/${data.id}/edit`)
    },
    onError: (error) => {
      pushToast(t(getTemplateErrorKey(error)))
    },
  })
}
