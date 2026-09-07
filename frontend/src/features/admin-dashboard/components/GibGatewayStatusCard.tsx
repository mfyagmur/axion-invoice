import { useTranslation } from 'react-i18next'
import { Card } from '@/components/Card'
import type { GibGatewayStatus } from '@/features/admin-dashboard/types/adminDashboard'

interface GibGatewayStatusCardProps {
  data: GibGatewayStatus | undefined
  isLoading: boolean
}

export function GibGatewayStatusCard({ data, isLoading }: GibGatewayStatusCardProps) {
  const { t } = useTranslation()

  return (
    <Card
      title={t('admin.dashboard.delivery.gib.title')}
      subtitle={t('admin.dashboard.delivery.gib.subtitle')}
      className="flex flex-1 flex-col justify-center gap-3"
    >
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isLoading && data && (
        <div className="flex items-center gap-3">
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              data.connected
                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${data.connected ? 'bg-green-500' : 'bg-red-500'}`} />
            {data.connected ? t('admin.dashboard.delivery.gib.connected') : t('admin.dashboard.delivery.gib.disconnected')}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {t('admin.dashboard.delivery.gib.uptime')}: {data.uptime_pct.toFixed(1)}%
          </span>
        </div>
      )}
    </Card>
  )
}
