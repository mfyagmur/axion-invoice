import { useMutation, useQueryClient } from '@tanstack/react-query'
import { templatesApi } from '@/features/invoice-editor/api/templatesApi'

export function useDeleteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => templatesApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}
