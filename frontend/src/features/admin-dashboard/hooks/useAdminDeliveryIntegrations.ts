import { useQuery } from '@tanstack/react-query'
import { adminDashboardApi } from '@/features/admin-dashboard/api/adminDashboardApi'

const REFRESH_INTERVAL_MS = 60_000

export function useAdminDeliveryIntegrations() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'delivery-integrations'],
    queryFn: adminDashboardApi.getDeliveryIntegrations,
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}
