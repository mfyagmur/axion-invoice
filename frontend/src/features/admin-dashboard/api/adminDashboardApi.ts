import { apiClient } from '@/lib/apiClient'
import type { AdminFinancialOverview, AdminSystemHealth } from '@/features/admin-dashboard/types/adminDashboard'

export const adminDashboardApi = {
  getFinancialOverview: () =>
    apiClient.get<AdminFinancialOverview>('/admin/dashboard/financial').then((res) => res.data),

  getSystemHealth: () => apiClient.get<AdminSystemHealth>('/admin/dashboard/system-health').then((res) => res.data),
}
