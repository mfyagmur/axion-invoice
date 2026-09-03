import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/Card'
import { ErrorState } from '@/components/ErrorState'
import { formatCurrency } from '@/utils/formatCurrency'
import { useDateFormat } from '@/hooks/useDateFormat'
import { SERIES_COLORS } from '@/features/dashboard/utils/chartColors'
import type { DashboardCharts } from '@/features/dashboard/types/dashboard'

interface PerformanceTrendChartProps {
  data: DashboardCharts | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  granularity: 'daily' | 'monthly'
  onGranularityChange: (granularity: 'daily' | 'monthly') => void
}

export function PerformanceTrendChart({
  data,
  isLoading,
  isError,
  onRetry,
  granularity,
  onGranularityChange,
}: PerformanceTrendChartProps) {
  const { t, i18n } = useTranslation()
  const { formatDate } = useDateFormat()
  const locale = i18n.language?.startsWith('en') ? 'en-US' : 'tr-TR'
  const monthFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { month: 'long' }), [locale])

  const currencies = useMemo(() => {
    const codes = new Set<string>()
    for (const point of data?.trend ?? []) {
      for (const code of Object.keys(point.total_amounts)) codes.add(code)
      for (const code of Object.keys(point.paid_amounts)) codes.add(code)
    }
    return Array.from(codes).sort()
  }, [data])

  const colorByCurrency = useMemo(() => {
    const map = new Map<string, string>()
    currencies.forEach((code, index) => map.set(code, SERIES_COLORS[index % SERIES_COLORS.length]))
    return map
  }, [currencies])

  const points = (data?.trend ?? []).map((point) => {
    const label =
      granularity === 'monthly'
        ? monthFormatter.format(new Date(`${point.date}T00:00:00`))
        : formatDate(point.date, { includeYear: false })
    const row: Record<string, string | number> = { date: label }
    for (const code of currencies) {
      row[`total_${code}`] = Number(point.total_amounts[code] ?? 0)
      row[`paid_${code}`] = Number(point.paid_amounts[code] ?? 0)
    }
    return row
  })

  return (
    <Card
      title={t('dashboard.demo.charts.trendTitle')}
      action={
        <div className="flex gap-1 rounded-md bg-slate-100 p-0.5 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => onGranularityChange('daily')}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              granularity === 'daily'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {t('dashboard.demo.charts.trendDaily')}
          </button>
          <button
            type="button"
            onClick={() => onGranularityChange('monthly')}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              granularity === 'monthly'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {t('dashboard.demo.charts.trendMonthly')}
          </button>
        </div>
      }
      className="flex h-full flex-col"
    >
      {isError && <ErrorState onRetry={onRetry} />}
      {!isError && isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isError && !isLoading && points.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.demo.charts.empty')}</p>
      )}
      {!isError && !isLoading && points.length > 0 && (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={points}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
            <XAxis dataKey="date" stroke="currentColor" className="text-slate-500 dark:text-slate-400" fontSize={12} />
            <YAxis
              stroke="currentColor"
              className="text-slate-500 dark:text-slate-400"
              fontSize={12}
              tickFormatter={(value: number) => formatCurrency(value)}
              width={80}
            />
            <Tooltip formatter={(value: number, name: string) => [`${formatCurrency(value)}`, name]} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {currencies.map((code) => (
              <Line
                key={`total_${code}`}
                type="monotone"
                dataKey={`total_${code}`}
                name={code}
                stroke={colorByCurrency.get(code)}
                strokeWidth={2}
                dot={false}
              />
            ))}
            {currencies.map((code) => (
              <Line
                key={`paid_${code}`}
                type="monotone"
                dataKey={`paid_${code}`}
                name={`${code}${t('dashboard.demo.charts.trendPaidSuffix')}`}
                stroke={colorByCurrency.get(code)}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
