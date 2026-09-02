import { apiClient } from '@/lib/apiClient'
import type { DashboardCharts, DashboardOverview } from '@/features/dashboard/types/dashboard'

export const dashboardApi = {
  getOverview: () => apiClient.get<DashboardOverview>('/dashboard/overview').then((res) => res.data),

  getCharts: (params: { currency: string; from: string; to: string }) =>
    apiClient
      .get<DashboardCharts>('/dashboard/charts', {
        params: { currency: params.currency, from: params.from, to: params.to },
      })
      .then((res) => res.data),
}
