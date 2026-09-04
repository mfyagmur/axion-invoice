import { useTranslation } from 'react-i18next'
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/Card'
import { ErrorState } from '@/components/ErrorState'
import type { LatencyPoint } from '@/features/admin-dashboard/types/adminDashboard'

interface ApiLatencyChartProps {
  series: LatencyPoint[] | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

function IssueDot(props: { cx?: number; cy?: number; payload?: LatencyPoint }) {
  const { cx, cy, payload } = props
  if (!payload?.is_issue || cx === undefined || cy === undefined) return null
  return <circle cx={cx} cy={cy} r={5} fill={payload.error_count > 0 ? '#ef4444' : '#f59e0b'} stroke="white" strokeWidth={1.5} />
}

export function ApiLatencyChart({ series, isLoading, isError, onRetry }: ApiLatencyChartProps) {
  const { t } = useTranslation()
  const points = series ?? []

  return (
    <Card title={t('admin.dashboard.system.apiLatency')} className="flex h-full max-h-108 flex-col">
      {isError && <ErrorState onRetry={onRetry} />}
      {!isError && isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isError && !isLoading && points.length > 0 && (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
              <XAxis dataKey="time_label" stroke="currentColor" className="text-slate-500 dark:text-slate-400" fontSize={12} />
              <YAxis
                stroke="currentColor"
                className="text-slate-500 dark:text-slate-400"
                fontSize={12}
                tickFormatter={(value: number) => `${value}ms`}
              />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === 'avg_latency_ms' ? [`${value.toFixed(0)}ms`, t('admin.dashboard.system.avgLatency')] : [value, name]
                }
              />
              <Bar dataKey="avg_latency_ms" fill="#93c5fd" radius={[3, 3, 0, 0]} barSize={18} />
              <Line
                type="monotone"
                dataKey="avg_latency_ms"
                stroke="#1e293b"
                strokeWidth={1.5}
                dot={<IssueDot />}
                activeDot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
