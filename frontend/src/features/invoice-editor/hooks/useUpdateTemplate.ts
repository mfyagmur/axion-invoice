import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { templatesApi } from '@/features/invoice-editor/api/templatesApi'
import type { TemplateSavePayload } from '@/types/template'

export function useUpdateTemplate(id: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: TemplateSavePayload) => templatesApi.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['templates'] })
      navigate('/dashboard/templates')
    },
  })
}
