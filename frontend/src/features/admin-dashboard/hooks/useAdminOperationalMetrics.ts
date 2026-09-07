import { useQuery } from '@tanstack/react-query'
import { adminDashboardApi } from '@/features/admin-dashboard/api/adminDashboardApi'

const REFRESH_INTERVAL_MS = 60_000

export function useAdminOperationalMetrics() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'operational-metrics'],
    queryFn: adminDashboardApi.getOperationalMetrics,
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}
