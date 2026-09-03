import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/features/dashboard/api/dashboardApi'

interface UseDashboardChartsParams {
  currency: string
  from: string | null
  to: string | null
}

export function useDashboardCharts({ currency, from, to }: UseDashboardChartsParams) {
  return useQuery({
    queryKey: ['dashboard', 'charts', currency, from, to],
    queryFn: () => dashboardApi.getCharts({ currency, from, to }),
    enabled: Boolean(currency),
  })
}
