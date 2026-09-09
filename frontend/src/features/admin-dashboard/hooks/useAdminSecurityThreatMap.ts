import { useQuery } from '@tanstack/react-query'
import { adminDashboardApi } from '@/features/admin-dashboard/api/adminDashboardApi'

const REFRESH_INTERVAL_MS = 20_000

export function useAdminSecurityThreatMap() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'security-threat-map'],
    queryFn: adminDashboardApi.getSecurityThreatMap,
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}
