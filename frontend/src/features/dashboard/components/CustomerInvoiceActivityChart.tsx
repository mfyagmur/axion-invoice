import { useTranslation } from 'react-i18next'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/Card'
import { ErrorState } from '@/components/ErrorState'
import { useDateFormat } from '@/hooks/useDateFormat'
import type { DashboardCharts } from '@/features/dashboard/types/dashboard'

interface CustomerInvoiceActivityChartProps {
  data: DashboardCharts | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export function CustomerInvoiceActivityChart({ data, isLoading, isError, onRetry }: CustomerInvoiceActivityChartProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()

  const totalInvoiceCount = (data?.status_distribution ?? []).reduce((sum, slice) => sum + slice.count, 0)
  const points = data
    ? [
        { name: t('dashboard.demo.charts.customerCount'), value: data.customer_count, color: '#4f46e5' },
        { name: t('dashboard.demo.charts.totalInvoices'), value: totalInvoiceCount, color: '#16a34a' },
      ]
    : []
  const hasData = points.some((point) => point.value > 0)
  const periodLabel = !data
    ? null
    : data.from_date && data.to_date
      ? `${formatDate(data.from_date)} – ${formatDate(data.to_date)}`
      : t('dashboard.demo.charts.allTime')

  return (
    <Card
      title={t('dashboard.demo.charts.customerActivityTitle')}
      action={periodLabel && <span className="text-xs text-slate-400 dark:text-slate-500">{periodLabel}</span>}
      className="flex h-full flex-col"
    >
      {isError && <ErrorState onRetry={onRetry} />}
      {!isError && isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isError && !isLoading && !hasData && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.demo.charts.empty')}</p>
      )}
      {!isError && !isLoading && hasData && (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={points}>
            <XAxis dataKey="name" stroke="currentColor" className="text-slate-500 dark:text-slate-400" fontSize={12} />
            <YAxis stroke="currentColor" className="text-slate-500 dark:text-slate-400" fontSize={12} allowDecimals={false} width={40} />
            <Tooltip />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {points.map((point) => (
                <Cell key={point.name} fill={point.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
