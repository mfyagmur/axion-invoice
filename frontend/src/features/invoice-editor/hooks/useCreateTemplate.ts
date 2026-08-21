import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { templatesApi } from '@/features/invoice-editor/api/templatesApi'
import { useToastStore } from '@/store/toastStore'

export function useCreateTemplate() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: templatesApi.create,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['templates'] })
      navigate(`/dashboard/templates/${data.id}/edit`, { replace: true })
      pushToast(t('editor.actions.savedToast'), 'success')
    },
  })
}
