import { useTranslation } from 'react-i18next'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '@/components/Card'
import type { ActiveUsersStat } from '@/features/admin-dashboard/types/adminDashboard'

interface ActiveUsersCardProps {
  data: ActiveUsersStat | undefined
  isLoading: boolean
}

export function ActiveUsersCard({ data, isLoading }: ActiveUsersCardProps) {
  const { t } = useTranslation()

  return (
    <Card title={t('admin.dashboard.operational.activeUsers.title')} className="flex flex-col gap-2 p-4">
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isLoading && data && (
        <div className="flex items-center gap-2">
          <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {data.total_registered}/{data.active_30d}
          </span>
          {data.registration_trend_pct !== null && (
            <span
              className={
                data.registration_trend_pct >= 0
                  ? 'flex items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300'
                  : 'flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300'
              }
            >
              {data.registration_trend_pct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(data.registration_trend_pct).toFixed(0)}%
            </span>
          )}
        </div>
      )}
    </Card>
  )
}
