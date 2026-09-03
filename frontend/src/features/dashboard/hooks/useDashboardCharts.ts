import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/features/dashboard/api/dashboardApi'

interface UseDashboardChartsParams {
  currency: string
  from: string | null
  to: string | null
  granularity: 'daily' | 'monthly'
}

export function useDashboardCharts({ currency, from, to, granularity }: UseDashboardChartsParams) {
  return useQuery({
    queryKey: ['dashboard', 'charts', currency, from, to, granularity],
    queryFn: () => dashboardApi.getCharts({ currency, from, to, granularity }),
    enabled: Boolean(currency),
    placeholderData: keepPreviousData,
  })
}
