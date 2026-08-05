import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminTemplatesApi } from '@/features/admin-templates/api/adminTemplatesApi'

export function useCreateXsltTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminTemplatesApi.createXslt,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
    },
  })
}
