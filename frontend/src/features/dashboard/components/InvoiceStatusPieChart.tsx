import { useTranslation } from 'react-i18next'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '@/components/Card'
import { ErrorState } from '@/components/ErrorState'
import { useDateFormat } from '@/hooks/useDateFormat'
import type { DashboardCharts } from '@/features/dashboard/types/dashboard'
import type { InvoiceDisplayStatus } from '@/types/invoice'
import { INVOICE_STATUS_BADGE_COLOR } from '@/features/invoices/utils/invoiceStatusBadge'

const STATUS_HEX: Record<NonNullable<(typeof INVOICE_STATUS_BADGE_COLOR)[InvoiceDisplayStatus]>, string> = {
  slate: '#64748b',
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
  amber: '#f59e0b',
}

interface InvoiceStatusPieChartProps {
  data: DashboardCharts | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export function InvoiceStatusPieChart({ data, isLoading, isError, onRetry }: InvoiceStatusPieChartProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()

  const slices = (data?.status_distribution ?? []).map((slice) => ({
    name: t(`invoices.status.${slice.status}`),
    value: slice.count,
    color: STATUS_HEX[INVOICE_STATUS_BADGE_COLOR[slice.status as InvoiceDisplayStatus] ?? 'slate'],
  }))
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)
  const periodLabel = !data
    ? null
    : data.from_date && data.to_date
      ? `${formatDate(data.from_date)} – ${formatDate(data.to_date)}`
      : t('dashboard.demo.charts.allTime')

  return (
    <Card
      title={t('dashboard.demo.charts.distributionTitle')}
      action={periodLabel && <span className="text-xs text-slate-400 dark:text-slate-500">{periodLabel}</span>}
      className="flex h-full flex-col"
    >
      {isError && <ErrorState onRetry={onRetry} />}
      {!isError && isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isError && !isLoading && total === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.demo.charts.empty')}</p>
      )}
      {!isError && !isLoading && total > 0 && (
        <div className="flex flex-1 flex-col items-center">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={slices} dataKey="value" nameKey="name" outerRadius={80} paddingAngle={2}>
                {slices.map((slice) => (
                  <Cell key={slice.name} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {slices.map((slice) => (
              <div key={slice.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: slice.color }} />
                {slice.name} ({slice.value})
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
