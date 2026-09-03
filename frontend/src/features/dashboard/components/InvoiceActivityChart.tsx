import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/Card'
import { ErrorState } from '@/components/ErrorState'
import { formatCurrency } from '@/utils/formatCurrency'
import { useDateFormat } from '@/hooks/useDateFormat'
import type { DashboardCharts } from '@/features/dashboard/types/dashboard'

interface InvoiceActivityChartProps {
  data: DashboardCharts | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export function InvoiceActivityChart({ data, isLoading, isError, onRetry }: InvoiceActivityChartProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()

  const points = (data?.activity ?? []).map((point) => ({
    date: formatDate(point.date, { includeYear: false }),
    amount: Number(point.amount),
  }))
  const periodLabel = !data
    ? null
    : data.from_date && data.to_date
      ? `${formatDate(data.from_date)} – ${formatDate(data.to_date)}`
      : t('dashboard.demo.charts.allTime')

  return (
    <Card
      title={t('dashboard.demo.charts.activityTitle')}
      action={periodLabel && <span className="text-xs text-slate-400 dark:text-slate-500">{periodLabel}</span>}
      className="flex h-full flex-col"
    >
      {isError && <ErrorState onRetry={onRetry} />}
      {!isError && isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isError && !isLoading && points.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.demo.charts.empty')}</p>
      )}
      {!isError && !isLoading && points.length > 0 && (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={points}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
            <XAxis dataKey="date" stroke="currentColor" className="text-slate-500 dark:text-slate-400" fontSize={12} />
            <YAxis
              stroke="currentColor"
              className="text-slate-500 dark:text-slate-400"
              fontSize={12}
              tickFormatter={(value: number) => formatCurrency(value)}
              width={80}
            />
            <Tooltip formatter={(value: number) => `${formatCurrency(value)} ${data?.currency ?? ''}`} />
            <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
