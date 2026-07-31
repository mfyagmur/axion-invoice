import { useQuery } from '@tanstack/react-query'
import { templatesApi } from '@/features/invoice-editor/api/templatesApi'

export function useTemplates() {
  return useQuery({ queryKey: ['templates'], queryFn: templatesApi.list })
}
