import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminTemplatesApi } from '@/features/admin-templates/api/adminTemplatesApi'
import type { XsltTemplateSavePayload } from '@/types/template'

export function useUpdateXsltTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: XsltTemplateSavePayload }) =>
      adminTemplatesApi.updateXslt(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
    },
  })
}
