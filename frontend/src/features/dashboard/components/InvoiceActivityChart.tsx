import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/Card'
import { ErrorState } from '@/components/ErrorState'
import { formatCurrency } from '@/utils/formatCurrency'
import { useDateFormat } from '@/hooks/useDateFormat'
import { SERIES_COLORS } from '@/features/dashboard/utils/chartColors'
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

  const currencies = useMemo(() => {
    const codes = new Set<string>()
    for (const point of data?.activity ?? []) {
      for (const code of Object.keys(point.currency_amounts)) codes.add(code)
    }
    return Array.from(codes).sort()
  }, [data])

  const colorByCurrency = useMemo(() => {
    const map = new Map<string, string>()
    currencies.forEach((code, index) => map.set(code, SERIES_COLORS[index % SERIES_COLORS.length]))
    return map
  }, [currencies])

  const points = (data?.activity ?? []).map((point) => {
    const row: Record<string, string | number> = { date: formatDate(point.date, { includeYear: false }) }
    for (const [code, amount] of Object.entries(point.currency_amounts)) {
      row[code] = Number(amount)
    }
    return row
  })
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
            <Tooltip formatter={(value: number, name: string) => [`${formatCurrency(value)} ${name}`, name]} />
            {currencies.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
            {currencies.map((code, index) => (
              <Bar
                key={code}
                dataKey={code}
                name={code}
                stackId="amount"
                fill={colorByCurrency.get(code)}
                radius={index === currencies.length - 1 ? [4, 4, 0, 0] : undefined}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
