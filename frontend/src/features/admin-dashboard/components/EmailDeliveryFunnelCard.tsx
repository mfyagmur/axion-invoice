import { useTranslation } from 'react-i18next'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/Card'
import type { EmailDeliveryFunnel } from '@/features/admin-dashboard/types/adminDashboard'

interface EmailDeliveryFunnelCardProps {
  data: EmailDeliveryFunnel | undefined
  isLoading: boolean
  className?: string
}

const RADIAN = Math.PI / 180

interface CustomizedLabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
}

function renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: CustomizedLabelProps) {
  if (percent <= 0) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

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
      ]
    : []

  const slices = legend.filter((row) => row.value > 0)

  return (
    <Card title={t('admin.dashboard.delivery.emailFunnel.title')} className={`w-131 ${className}`}>
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isLoading && data && (
        <div className="flex items-center justify-center gap-10">
          <div className="relative shrink-0">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={slices.length > 0 ? slices : legend}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={renderCustomizedLabel}
                  isAnimationActive
                  animationDuration={900}
                  animationEasing="ease-out"
                  stroke="none"
                >
                  {(slices.length > 0 ? slices : legend).map((row) => (
                    <Cell key={row.key} fill={row.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex shrink-0 flex-col gap-2">
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
