import { useTranslation } from 'react-i18next'
import { Card } from '@/components/Card'
import type { SlowQueryAlert } from '@/features/admin-dashboard/types/adminDashboard'

interface SlowQueriesCardProps {
  alerts: SlowQueryAlert[] | undefined
  isLoading: boolean
  className?: string
}

const DOT_COLOR: Record<SlowQueryAlert['severity'], string> = {
  ok: 'bg-green-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
}

export function SlowQueriesCard({ alerts, isLoading, className = '' }: SlowQueriesCardProps) {
  const { t } = useTranslation()
  const rows = alerts ?? []

  return (
    <Card title={t('admin.dashboard.system.slowQueryAlerts')} className={`flex flex-col py-3 px-5 ${className}`}>
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isLoading &&
        rows.map((alert) => (
          <div key={alert.key} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${DOT_COLOR[alert.severity]}`} />
              <span className="text-sm text-slate-700 dark:text-slate-300">{t(`admin.dashboard.system.slowQueryKeys.${alert.key}`)}</span>
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{alert.count}</span>
          </div>
        ))}
    </Card>
  )
}
