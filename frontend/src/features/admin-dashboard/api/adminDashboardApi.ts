import { apiClient } from '@/lib/apiClient'
import type {
  AdminDeliveryIntegrations,
  AdminFinancialOverview,
  AdminOperationalMetrics,
  AdminSystemHealth,
  SecurityAlertsResponse,
  SecurityAuditLogsResponse,
  SecurityLoginActivitiesResponse,
  SecurityThreatMapResponse,
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

  getSecurityThreatMap: () =>
    apiClient.get<SecurityThreatMapResponse>('/admin/dashboard/security-threat-map').then((res) => res.data),

  getSecurityLoginActivities: () =>
    apiClient
      .get<SecurityLoginActivitiesResponse>('/admin/dashboard/security-login-activities')
      .then((res) => res.data),

  getSecurityAuditLogs: () =>
    apiClient.get<SecurityAuditLogsResponse>('/admin/dashboard/security-audit-logs').then((res) => res.data),

  getSecurityAlerts: () =>
    apiClient.get<SecurityAlertsResponse>('/admin/dashboard/security-alerts').then((res) => res.data),
}
