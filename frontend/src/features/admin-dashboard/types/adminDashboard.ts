import type { TrendPoint } from '@/features/dashboard/types/dashboard'

export interface CurrencyMtdAmount {
  currency: string
  amount: string
  trend_pct: number | null
}

export interface PaymentSuccessRate {
  paid_pct: number
  pending_pct: number
  failed_pct: number
  paid_count: number
  pending_count: number
  failed_count: number
}

export interface SparklinePoint {
  date: string
  count: number
}

export interface CountWithSparkline {
  count: number
  trend_pct: number | null
  sparkline: SparklinePoint[]
}

export interface AdminFinancialOverview {
  revenue_trend: TrendPoint[]
  total_invoiced_mtd: CurrencyMtdAmount[]
  payment_success_rate: PaymentSuccessRate
  paid_invoices_mtd: CountWithSparkline
  overdue_invoices: CountWithSparkline
}

export interface LatencyPoint {
  time_label: string
  avg_latency_ms: number
  error_count: number
  is_issue: boolean
}

export type SlowQueryAlertKey = 'slow_requests' | 'server_errors'
export type SlowQueryAlertSeverity = 'ok' | 'warning' | 'error'

export interface SlowQueryAlert {
  key: SlowQueryAlertKey
  count: number
  severity: SlowQueryAlertSeverity
}

export interface AdminSystemHealth {
  api_latency_series: LatencyPoint[]
  active_server_instances: number
  avg_cpu_load_pct: number
  avg_memory_usage_pct: number
  database_healthy: boolean
  slow_query_alerts: SlowQueryAlert[]
}

export interface RequestIssueDetail {
  timestamp: string
  method: string
  path: string
  status_code: number
  duration_ms: number
  is_slow: boolean
  is_error: boolean
  error_detail: string | null
}

export interface SlowQueryDetailResponse {
  slow_requests: RequestIssueDetail[]
  server_errors: RequestIssueDetail[]
}

export interface EmailDeliveryFunnel {
  draft: number
  sent: number
  delivered: number
}

export interface GibGatewayStatus {
  connected: boolean
  uptime_pct: number
}

export interface AdminDeliveryIntegrations {
  email_funnel: EmailDeliveryFunnel
  gib_status: GibGatewayStatus
}

export interface ActiveUsersStat {
  total_registered: number
  active_30d: number
  registration_trend_pct: number | null
}

export interface PacketUsageSlice {
  plan_key: string
  plan_name: string
  user_count: number
  pct: number
}

export type SupportTicketStatus = 'connected' | 'not_connected'
export type SupportTicketPriority = 'priority' | 'not_priority'

export interface SupportTicket {
  user_name: string
  issue: string
  status: SupportTicketStatus
  priority: SupportTicketPriority
}

export interface AdminOperationalMetrics {
  active_users: ActiveUsersStat
  invoices_created_today: number
  packet_usage: PacketUsageSlice[]
  support_tickets: SupportTicket[]
}
