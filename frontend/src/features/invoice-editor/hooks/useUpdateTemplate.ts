import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { templatesApi } from '@/features/invoice-editor/api/templatesApi'
import { useToastStore } from '@/store/toastStore'
import type { TemplateSavePayload } from '@/types/template'

export function useUpdateTemplate(id: string) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (payload: TemplateSavePayload) => templatesApi.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['templates'] })
      pushToast(t('editor.actions.savedToast'), 'success')
    },
  })
}
