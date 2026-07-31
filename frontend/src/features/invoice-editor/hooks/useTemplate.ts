import { useQuery } from '@tanstack/react-query'
import { templatesApi } from '@/features/invoice-editor/api/templatesApi'

export function useTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: () => templatesApi.get(id!),
    enabled: !!id,
  })
}
