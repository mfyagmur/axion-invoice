import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    if (!data) return
    setAnimated(false)
    const frame = requestAnimationFrame(() => setAnimated(true))
    return () => cancelAnimationFrame(frame)
  }, [data])

  return (
    <Card title={t('admin.dashboard.operational.packetUsage.title')} className={`h-full ${className}`}>
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isLoading && data && (
        <div className="flex flex-col">
          {data.map((row) => {
            const color = PLAN_COLORS[row.plan_key] ?? '#94a3b8'
            const pct = Math.min(Math.max(row.pct, 0), 100)
            return (
              <div key={row.plan_key} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    {row.plan_name}
                  </span>
                  <span className="tabular-nums text-slate-500 dark:text-slate-400">
                    {row.user_count} · {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full transition-[width] duration-700 ease-out"
                    style={{ width: animated ? `${pct}%` : '0%', backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
