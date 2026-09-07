import { useQuery } from '@tanstack/react-query'
import { adminDashboardApi } from '@/features/admin-dashboard/api/adminDashboardApi'

export function useAdminSlowQueryDetails(enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'slow-query-details'],
    queryFn: adminDashboardApi.getSlowQueryDetails,
    enabled,
  })
}
