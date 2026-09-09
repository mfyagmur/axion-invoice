import { useQuery } from '@tanstack/react-query'
import { adminDashboardApi } from '@/features/admin-dashboard/api/adminDashboardApi'

const REFRESH_INTERVAL_MS = 20_000

export function useAdminSecurityAlerts() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'security-alerts'],
    queryFn: adminDashboardApi.getSecurityAlerts,
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}
