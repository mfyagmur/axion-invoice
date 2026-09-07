import { useTranslation } from 'react-i18next'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/Card'
import type { SmsNotificationStatus } from '@/features/admin-dashboard/types/adminDashboard'

interface SmsGaugeCardProps {
  data: SmsNotificationStatus | undefined
  isLoading: boolean
}

export function SmsGaugeCard({ data, isLoading }: SmsGaugeCardProps) {
  const { t } = useTranslation()

  const slices = data
    ? [
        { name: t('admin.dashboard.delivery.sms.delivered'), value: data.delivered, color: '#22c55e' },
        { name: t('admin.dashboard.delivery.sms.pending'), value: data.pending, color: '#f97316' },
        { name: t('admin.dashboard.delivery.sms.failed'), value: data.failed, color: '#ef4444' },
      ]
    : []
  const total = data ? data.delivered + data.pending + data.failed : 0
  const chartSlices = total > 0 ? slices : slices.map((slice) => ({ ...slice, value: 1 }))

  return (
    <Card title={t('admin.dashboard.delivery.sms.title')} className="flex flex-1 flex-col">
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isLoading && data && (
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="relative h-[84px] w-[164px] overflow-hidden">
            <ResponsiveContainer width={164} height={164}>
              <PieChart>
                <Pie
                  data={chartSlices}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy={164 / 2}
                  startAngle={180}
                  endAngle={0}
                  innerRadius={56}
                  outerRadius={78}
                  paddingAngle={2}
                  isAnimationActive
                  animationDuration={900}
                  animationEasing="ease-out"
                  stroke="none"
                >
                  {chartSlices.map((slice, index) => (
                    <Cell key={slices[index]?.name ?? index} fill={total > 0 ? slice.color : '#e2e8f0'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{total}</span>
            </div>
          </div>
          <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {slices.map((slice) => (
              <div key={slice.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: slice.color }} />
                {slice.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
