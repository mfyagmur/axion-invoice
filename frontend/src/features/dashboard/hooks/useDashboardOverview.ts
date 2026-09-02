import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/features/dashboard/api/dashboardApi'

export function useDashboardOverview() {
  return useQuery({ queryKey: ['dashboard', 'overview'], queryFn: dashboardApi.getOverview })
}
