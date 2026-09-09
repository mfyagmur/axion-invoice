import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, ServerCog, ShieldAlert, Info } from 'lucide-react'
import { Card } from '@/components/Card'
import type { SecurityAlertItem, SecurityAlertSeverity } from '@/features/admin-dashboard/types/adminDashboard'

interface SecurityAlertsCardProps {
  data: SecurityAlertItem[] | undefined
  isLoading: boolean
  className?: string
}

const SEVERITY_STYLE: Record<SecurityAlertSeverity, { row: string; icon: ReactNode; label: (t: (key: string) => string) => string }> = {
  critical: {
    row: 'text-red-600 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/20 dark:border-red-900/40',
    icon: <ShieldAlert size={14} />,
    label: (t) => t('admin.dashboard.security.alerts.critical'),
  },
  high: {
    row: 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-900/20 dark:border-orange-900/40',
    icon: <AlertTriangle size={14} />,
    label: (t) => t('admin.dashboard.security.alerts.high'),
  },
  web_server: {
    row: 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-300 dark:bg-sky-900/20 dark:border-sky-900/40',
    icon: <ServerCog size={14} />,
    label: (t) => t('admin.dashboard.security.alerts.webServer'),
  },
  low: {
    row: 'text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-300 dark:bg-slate-800/40 dark:border-slate-700',
    icon: <Info size={14} />,
    label: (t) => t('admin.dashboard.security.alerts.low'),
  },
}

const MAX_PREVIEW_ROWS = 5

export function SecurityAlertsCard({ data, isLoading, className }: SecurityAlertsCardProps) {
  const { t } = useTranslation()
  const alerts = (data ?? []).slice(0, MAX_PREVIEW_ROWS)

  return (
    <Card
      icon={<AlertTriangle size={16} />}
      title={t('admin.dashboard.security.alerts.title')}
      className={`flex h-full flex-col ${className ?? ''}`}
    >
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isLoading && alerts.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin.dashboard.security.alerts.empty')}</p>
      )}
      {!isLoading && alerts.length > 0 && (
        <div className="flex-1 space-y-2 overflow-auto">
          {alerts.map((alert) => {
            const style = SEVERITY_STYLE[alert.severity]
            return (
              <div key={alert.id} className={`rounded-lg border px-3 py-2 text-xs ${style.row}`}>
                <div className="flex items-center gap-1.5 font-semibold">
                  {style.icon}
                  <span>{style.label(t)}</span>
                  <span className="ml-auto text-[10px] font-normal opacity-70">
                    {new Date(alert.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-1 font-medium">{alert.title}</p>
                {alert.description && <p className="mt-0.5 opacity-90">{alert.description}</p>}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
