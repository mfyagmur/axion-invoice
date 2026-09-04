import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/Card'
import { ErrorState } from '@/components/ErrorState'
import { formatCurrency } from '@/utils/formatCurrency'
import { SERIES_COLORS } from '@/features/dashboard/utils/chartColors'
import type { TrendPoint } from '@/features/dashboard/types/dashboard'

interface RevenueTrendsCardProps {
  trend: TrendPoint[] | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export function RevenueTrendsCard({ trend, isLoading, isError, onRetry }: RevenueTrendsCardProps) {
  const { t, i18n } = useTranslation()
  const [view, setView] = useState<'graph' | 'table'>('graph')
  const locale = i18n.language?.startsWith('en') ? 'en-US' : 'tr-TR'
  const monthFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { month: 'short' }), [locale])

  const currencies = useMemo(() => {
    const codes = new Set<string>()
    for (const point of trend ?? []) {
      for (const code of Object.keys(point.total_amounts)) codes.add(code)
    }
    return Array.from(codes).sort()
  }, [trend])

  const colorByCurrency = useMemo(() => {
    const map = new Map<string, string>()
    currencies.forEach((code, index) => map.set(code, SERIES_COLORS[index % SERIES_COLORS.length]))
    return map
  }, [currencies])

  const points = (trend ?? []).map((point) => {
    const row: Record<string, string | number> = { date: monthFormatter.format(new Date(`${point.date}T00:00:00`)) }
    for (const code of currencies) {
      row[code] = Number(point.total_amounts[code] ?? 0)
    }
    return row
  })

  return (
    <Card
      title={t('admin.dashboard.financial.revenueTrends')}
      action={
        <select
          value={view}
          onChange={(event) => setView(event.target.value as 'graph' | 'table')}
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="graph">{t('admin.dashboard.financial.graphView')}</option>
          <option value="table">{t('admin.dashboard.financial.tableView')}</option>
        </select>
      }
      className="flex h-full flex-col p-4"
    >
      <div className="flex h-56 flex-col">
        {isError && <ErrorState onRetry={onRetry} />}
        {!isError && isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
        {!isError && !isLoading && points.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.demo.charts.empty')}</p>
        )}
        {!isError && !isLoading && points.length > 0 && view === 'graph' && (
          <ResponsiveContainer width="100%" height="100%">
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
              <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name]} />
              {currencies.map((code) => (
                <Line
                  key={code}
                  type="monotone"
                  dataKey={code}
                  name={code}
                  stroke={colorByCurrency.get(code)}
                  strokeWidth={2.5}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
        {!isError && !isLoading && points.length > 0 && view === 'table' && (
          <div className="h-full overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  <th className="pb-2">{t('admin.dashboard.financial.month')}</th>
                  {currencies.map((code) => (
                    <th key={code} className="pb-2 text-right">
                      {code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {points.map((row, index) => (
                  <tr key={index} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="py-1.5 text-slate-700 dark:text-slate-300">{row.date}</td>
                    {currencies.map((code) => (
                      <td key={code} className="py-1.5 text-right text-slate-900 dark:text-slate-100">
                        {formatCurrency(row[code] ?? 0)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  )
}
