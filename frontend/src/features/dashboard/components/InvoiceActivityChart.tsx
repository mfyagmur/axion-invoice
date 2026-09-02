import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/Card'
import { ErrorState } from '@/components/ErrorState'
import { formatCurrency } from '@/utils/formatCurrency'
import type { DashboardCharts } from '@/features/dashboard/types/dashboard'

interface InvoiceActivityChartProps {
  data: DashboardCharts | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export function InvoiceActivityChart({ data, isLoading, isError, onRetry }: InvoiceActivityChartProps) {
  const { t } = useTranslation()

  const points = (data?.activity ?? []).map((point) => ({
    date: new Date(point.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
    amount: Number(point.amount),
  }))

  return (
    <Card title={t('dashboard.demo.charts.activityTitle')} className="flex h-full flex-col">
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
