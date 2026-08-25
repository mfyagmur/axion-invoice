import { useMutation, useQueryClient } from '@tanstack/react-query'
import { templatesApi } from '@/features/invoice-editor/api/templatesApi'

export function useDemoteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => templatesApi.demote(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}
