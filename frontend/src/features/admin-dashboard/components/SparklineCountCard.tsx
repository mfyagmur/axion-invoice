import { useTranslation } from 'react-i18next'
import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/Card'
import type { CountWithSparkline } from '@/features/admin-dashboard/types/adminDashboard'

interface SparklineCountCardProps {
  title: string
  caption: string
  data: CountWithSparkline | undefined
  isLoading: boolean
  color: string
}

export function SparklineCountCard({ title, caption, data, isLoading, color }: SparklineCountCardProps) {
  const { t } = useTranslation()
  const points = data?.sparkline.map((point) => ({ value: point.count })) ?? []

  return (
    <Card title={title} className="flex h-full flex-col p-4">
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isLoading && data && (
        <div className="flex flex-1 items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-xl font-semibold text-slate-900 dark:text-slate-100">{data.count}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{caption}</span>
          </div>
          <div className="h-8 w-20 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points}>
                <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Card>
  )
}
