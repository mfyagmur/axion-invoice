import { useTranslation } from 'react-i18next'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/Card'
import type { EmailDeliveryFunnel } from '@/features/admin-dashboard/types/adminDashboard'

interface EmailDeliveryFunnelCardProps {
  data: EmailDeliveryFunnel | undefined
  isLoading: boolean
  className?: string
}

const RINGS: { key: keyof EmailDeliveryFunnel; color: string; outerRadius: number; innerRadius: number }[] = [
  { key: 'sent', color: '#3b82f6', outerRadius: 66, innerRadius: 56 },
  { key: 'delivered', color: '#22c55e', outerRadius: 54, innerRadius: 44 },
  { key: 'opened', color: '#38bdf8', outerRadius: 42, innerRadius: 32 },
  { key: 'clicked', color: '#f97316', outerRadius: 30, innerRadius: 20 },
]

export function EmailDeliveryFunnelCard({ data, isLoading, className }: EmailDeliveryFunnelCardProps) {
  const { t } = useTranslation()

  const legend = data
    ? [
        { key: 'draft', label: t('admin.dashboard.delivery.emailFunnel.draft'), value: data.draft, color: '#94a3b8' },
        { key: 'sent', label: t('admin.dashboard.delivery.emailFunnel.sent'), value: data.sent, color: '#3b82f6' },
        {
          key: 'delivered',
          label: t('admin.dashboard.delivery.emailFunnel.delivered'),
          value: data.delivered,
          color: '#22c55e',
        },
        { key: 'opened', label: t('admin.dashboard.delivery.emailFunnel.opened'), value: data.opened, color: '#38bdf8' },
        { key: 'clicked', label: t('admin.dashboard.delivery.emailFunnel.clicked'), value: data.clicked, color: '#f97316' },
        { key: 'bounced', label: t('admin.dashboard.delivery.emailFunnel.bounced'), value: data.bounced, color: '#ef4444' },
      ]
    : []

  const maxValue = data ? Math.max(data.sent, 1) : 1

  return (
    <Card title={t('admin.dashboard.delivery.emailFunnel.title')} className={`${className}`}>
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isLoading && data && (
        <div className="flex flex-1 items-center justify-center gap-4">
          <div className="relative shrink-0">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                {RINGS.map((ring) => {
                  const value = Math.max(data[ring.key] as number, 0)
                  const filled = value > 0 ? value / maxValue : 0.02
                  const slices = [
                    { name: 'filled', value: filled },
                    { name: 'rest', value: 1 - filled },
                  ]
                  return (
                    <Pie
                      key={ring.key}
                      data={slices}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      innerRadius={ring.innerRadius}
                      outerRadius={ring.outerRadius}
                      isAnimationActive
                      animationDuration={900}
                      animationEasing="ease-out"
                      stroke="none"
                    >
                      <Cell fill={ring.color} />
                      <Cell fill="transparent" />
                    </Pie>
                  )
                })}
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{data.sent}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('admin.dashboard.delivery.emailFunnel.sent')}</span>
            </div>
          </div>
          <div className="flex flex-1 shrink-0 flex-col gap-2">
            {legend.map((row) => (
              <div key={row.key} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                  {row.label}
                </div>
                <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
