import { useQuery } from '@tanstack/react-query'
import { adminDashboardApi } from '@/features/admin-dashboard/api/adminDashboardApi'

const REFRESH_INTERVAL_MS = 20_000

export function useAdminSecurityAuditLogs() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'security-audit-logs'],
    queryFn: adminDashboardApi.getSecurityAuditLogs,
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}
