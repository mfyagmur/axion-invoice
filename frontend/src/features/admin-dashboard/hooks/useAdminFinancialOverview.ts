import { useQuery } from '@tanstack/react-query'
import { adminDashboardApi } from '@/features/admin-dashboard/api/adminDashboardApi'

const REFRESH_INTERVAL_MS = 60_000

export function useAdminFinancialOverview() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'financial'],
    queryFn: adminDashboardApi.getFinancialOverview,
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}
