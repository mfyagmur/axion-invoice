import { useQuery } from '@tanstack/react-query'
import { adminDashboardApi } from '@/features/admin-dashboard/api/adminDashboardApi'

const REFRESH_INTERVAL_MS = 20_000

export function useAdminSecurityLoginActivities() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'security-login-activities'],
    queryFn: adminDashboardApi.getSecurityLoginActivities,
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}
