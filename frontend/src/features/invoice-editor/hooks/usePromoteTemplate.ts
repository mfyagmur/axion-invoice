import { useMutation, useQueryClient } from '@tanstack/react-query'
import { templatesApi } from '@/features/invoice-editor/api/templatesApi'

export function usePromoteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => templatesApi.promote(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}
