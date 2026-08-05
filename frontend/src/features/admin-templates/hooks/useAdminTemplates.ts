import { useQuery } from '@tanstack/react-query'
import { adminTemplatesApi } from '@/features/admin-templates/api/adminTemplatesApi'

export function useAdminTemplates() {
  return useQuery({ queryKey: ['admin-templates'], queryFn: adminTemplatesApi.list })
}
