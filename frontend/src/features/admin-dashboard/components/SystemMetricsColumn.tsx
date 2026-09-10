import { useTranslation } from 'react-i18next'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Card } from '@/components/Card'
import type { AdminSystemHealth } from '@/features/admin-dashboard/types/adminDashboard'

interface SystemMetricsColumnProps {
  data: AdminSystemHealth | undefined
  isLoading: boolean
}

export function SystemMetricsColumn({ data, isLoading }: SystemMetricsColumnProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="flex flex-col justify-between gap-1 border-transparent! bg-green-600 p-4 text-white dark:bg-green-700">
        <span className="text-sm font-medium text-green-50">{t('admin.dashboard.system.activeInstances')}</span>
        <span className="text-2xl font-semibold">{isLoading ? '—' : data?.active_server_instances}</span>
      </Card>

      <Card className="flex flex-col justify-between gap-1 border-transparent! bg-blue-600 p-4 text-white dark:bg-blue-700">
        <span className="text-sm font-medium text-blue-50">{t('admin.dashboard.system.activeUsers')}</span>
        <span className="text-2xl font-semibold">
          {isLoading ? '—' : `${data?.active_users_total} / ${data?.active_users_registered}`}
        </span>
        <span className="text-xs text-blue-100">{t('admin.dashboard.system.activeUsersHint')}</span>
      </Card>

      <Card className="flex flex-col gap-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('admin.dashboard.system.avgCpuLoad')}</span>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${Math.min(data?.avg_cpu_load_pct ?? 0, 100)}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">{(data?.avg_cpu_load_pct ?? 0).toFixed(0)}%</span>
      </Card>

      <Card className="flex flex-col gap-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('admin.dashboard.system.avgMemoryUsage')}</span>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${Math.min(data?.avg_memory_usage_pct ?? 0, 100)}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">{(data?.avg_memory_usage_pct ?? 0).toFixed(0)}%</span>
      </Card>

      <Card className="col-span-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('admin.dashboard.system.databaseHealthy')}</span>
        {data?.database_healthy ? (
          <CheckCircle2 className="text-green-600 dark:text-green-400" size={22} />
        ) : (
          <XCircle className="text-red-600 dark:text-red-400" size={22} />
        )}
      </Card>
    </div>
  )
}
