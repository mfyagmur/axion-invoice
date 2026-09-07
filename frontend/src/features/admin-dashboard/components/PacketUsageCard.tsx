import { useTranslation } from 'react-i18next'
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/Card'
import type { PacketUsageSlice } from '@/features/admin-dashboard/types/adminDashboard'

interface PacketUsageCardProps {
  data: PacketUsageSlice[] | undefined
  isLoading: boolean
  className?: string
}

const PLAN_COLORS: Record<string, string> = {
  free: '#1d4ed8',
  pro: '#0ea5e9',
  business: '#93c5fd',
}

export function PacketUsageCard({ data, isLoading, className }: PacketUsageCardProps) {
  const { t } = useTranslation()

  const rows = (data ?? []).map((slice) => ({
    ...slice,
    label: slice.plan_name,
  }))

  return (
    <Card title={t('admin.dashboard.operational.packetUsage.title')} className={className}>
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isLoading && data && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {rows.map((row) => (
              <div key={row.plan_key} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PLAN_COLORS[row.plan_key] ?? '#94a3b8' }} />
                {row.label}
              </div>
            ))}
          </div>
          <div className="h-[168px] w-full">
            <ResponsiveContainer width="100%" height={168}>
              <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}`} />
                <YAxis type="category" dataKey="label" width={56} tick={{ fontSize: 12 }} />
                <Bar dataKey="pct" radius={[0, 4, 4, 0]} isAnimationActive animationDuration={900} animationEasing="ease-out">
                  {rows.map((row) => (
                    <Cell key={row.plan_key} fill={PLAN_COLORS[row.plan_key] ?? '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Card>
  )
}
