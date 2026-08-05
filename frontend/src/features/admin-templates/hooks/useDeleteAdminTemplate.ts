import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminTemplatesApi } from '@/features/admin-templates/api/adminTemplatesApi'

export function useDeleteAdminTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => adminTemplatesApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
    },
  })
}
