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
