import type { InvoiceSummary } from '@/types/invoice'

export interface CurrencyAmount {
  currency: string
  amount: string
  count: number
}

export interface KpiCard {
  currency_breakdown: CurrencyAmount[]
  total_count: number
  try_amount_trend_pct: number | null
}

export interface DashboardCustomerRow {
  id: string
  name: string
  customer_type: string
  email: string | null
  invoiced_breakdown: CurrencyAmount[]
  pending_breakdown: CurrencyAmount[]
}

export interface DashboardOverview {
  total: KpiCard
  paid: KpiCard
  pending: KpiCard
  overdue: KpiCard
  draft: KpiCard
  recent_invoices: InvoiceSummary[]
  top_customers: DashboardCustomerRow[]
}

export interface StatusDistributionSlice {
  status: string
  count: number
}

export interface ActivityPoint {
  date: string
  amount: string
  currency_amounts: Record<string, string>
}

export interface DashboardCharts {
  currency: string
  from_date: string | null
  to_date: string | null
  status_distribution: StatusDistributionSlice[]
  activity: ActivityPoint[]
  customer_count: number
}
