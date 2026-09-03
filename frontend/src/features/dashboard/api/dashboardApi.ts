import { apiClient } from '@/lib/apiClient'
import type { DashboardCharts, DashboardOverview } from '@/features/dashboard/types/dashboard'

export const dashboardApi = {
  getOverview: () => apiClient.get<DashboardOverview>('/dashboard/overview').then((res) => res.data),

  getCharts: (params: { currency: string; from: string | null; to: string | null }) =>
    apiClient
      .get<DashboardCharts>('/dashboard/charts', {
        params: { currency: params.currency, from: params.from ?? undefined, to: params.to ?? undefined },
      })
      .then((res) => res.data),
}
