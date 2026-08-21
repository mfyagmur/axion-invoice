import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { templatesApi } from '@/features/invoice-editor/api/templatesApi'
import type { TemplateSavePayload } from '@/types/template'

interface AutoSaveArgs {
  id?: string
  isOwnedExisting: boolean
  payload: TemplateSavePayload
}

export function useAutoSaveTemplate() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ id, isOwnedExisting, payload }: AutoSaveArgs) =>
      isOwnedExisting && id ? templatesApi.update(id, payload) : templatesApi.create(payload),
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['templates'] })
      if (!variables.isOwnedExisting) {
        navigate(`/dashboard/templates/${data.id}/edit`, { replace: true })
      }
    },
  })
}
