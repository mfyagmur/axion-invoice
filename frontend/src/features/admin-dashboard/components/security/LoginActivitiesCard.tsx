import { useTranslation } from 'react-i18next'
import { KeyRound } from 'lucide-react'
import { Card } from '@/components/Card'
import type { LoginActivityRow, LoginActivityStatus } from '@/features/admin-dashboard/types/adminDashboard'

interface LoginActivitiesCardProps {
  data: LoginActivityRow[] | undefined
  isLoading: boolean
  className?: string
}

const STATUS_STYLE: Record<LoginActivityStatus, string> = {
  success: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  suspicious: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
}

const MAX_PREVIEW_ROWS = 5

export function LoginActivitiesCard({ data, isLoading, className }: LoginActivitiesCardProps) {
  const { t } = useTranslation()
  const rows = (data ?? []).slice(0, MAX_PREVIEW_ROWS)

  const statusLabel = (status: LoginActivityStatus) =>
    status === 'success'
      ? t('admin.dashboard.security.loginActivities.statusSuccess')
      : status === 'failed'
        ? t('admin.dashboard.security.loginActivities.statusFailed')
        : t('admin.dashboard.security.loginActivities.statusSuspicious')

  return (
    <Card
      icon={<KeyRound size={16} />}
      title={t('admin.dashboard.security.loginActivities.title')}
      className={`flex h-full flex-col ${className ?? ''}`}
    >
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isLoading && rows.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin.dashboard.security.loginActivities.empty')}</p>
      )}
      {!isLoading && rows.length > 0 && (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="pb-2 pr-2 font-medium">{t('admin.dashboard.security.loginActivities.time')}</th>
                <th className="pb-2 pr-2 font-medium">{t('admin.dashboard.security.loginActivities.user')}</th>
                <th className="pb-2 pr-2 font-medium">{t('admin.dashboard.security.loginActivities.location')}</th>
                <th className="pb-2 pr-2 font-medium">{t('admin.dashboard.security.loginActivities.ip')}</th>
                <th className="pb-2 font-medium">{t('admin.dashboard.security.loginActivities.status')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={`${row.time}-${index}`}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                >
                  <td className="whitespace-nowrap py-1.5 pr-2 text-slate-500 dark:text-slate-400">
                    {new Date(row.time).toLocaleTimeString()}
                  </td>
                  <td className="max-w-[110px] truncate py-1.5 pr-2 text-slate-700 dark:text-slate-200">{row.user}</td>
                  <td className="max-w-[100px] truncate py-1.5 pr-2 text-slate-600 dark:text-slate-300">
                    {row.location ?? '—'}
                  </td>
                  <td className="py-1.5 pr-2 text-slate-500 dark:text-slate-400">{row.ip ?? '—'}</td>
                  <td className="py-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[row.status]}`}>
                      {statusLabel(row.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
