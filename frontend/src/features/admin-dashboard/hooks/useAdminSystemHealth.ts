import { useQuery } from '@tanstack/react-query'
import { adminDashboardApi } from '@/features/admin-dashboard/api/adminDashboardApi'

const REFRESH_INTERVAL_MS = 15_000

export function useAdminSystemHealth() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'system-health'],
    queryFn: adminDashboardApi.getSystemHealth,
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}
