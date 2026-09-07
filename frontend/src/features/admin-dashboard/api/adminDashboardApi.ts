import { apiClient } from '@/lib/apiClient'
import type {
  AdminDeliveryIntegrations,
  AdminFinancialOverview,
  AdminOperationalMetrics,
  AdminSystemHealth,
  SlowQueryDetailResponse,
} from '@/features/admin-dashboard/types/adminDashboard'

export const adminDashboardApi = {
  getFinancialOverview: () =>
    apiClient.get<AdminFinancialOverview>('/admin/dashboard/financial').then((res) => res.data),

  getSystemHealth: () => apiClient.get<AdminSystemHealth>('/admin/dashboard/system-health').then((res) => res.data),

  getSlowQueryDetails: () =>
    apiClient.get<SlowQueryDetailResponse>('/admin/dashboard/slow-query-details').then((res) => res.data),

  getDeliveryIntegrations: () =>
    apiClient.get<AdminDeliveryIntegrations>('/admin/dashboard/delivery-integrations').then((res) => res.data),

  getOperationalMetrics: () =>
    apiClient.get<AdminOperationalMetrics>('/admin/dashboard/operational-metrics').then((res) => res.data),
}
