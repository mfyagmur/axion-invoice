import { useTranslation } from 'react-i18next'
import { LogIn, LogOut, ShieldAlert, KeyRound, ScrollText } from 'lucide-react'
import { Card } from '@/components/Card'
import type { AuditLogEntry } from '@/features/admin-dashboard/types/adminDashboard'

interface SystemAuditCardProps {
  data: AuditLogEntry[] | undefined
  isLoading: boolean
  onViewAll: () => void
  className?: string
}

const MAX_PREVIEW_ROWS = 5

function actionIcon(action: string) {
  if (action.startsWith('login.success')) return <LogIn size={14} className="text-green-600 dark:text-green-400" />
  if (action === 'login.failed') return <ShieldAlert size={14} className="text-red-600 dark:text-red-400" />
  if (action === 'logout') return <LogOut size={14} className="text-slate-500 dark:text-slate-400" />
  if (action === 'session.revoked_reuse_detected') return <ShieldAlert size={14} className="text-amber-600 dark:text-amber-400" />
  if (action === 'password.reset_completed') return <KeyRound size={14} className="text-blue-600 dark:text-blue-400" />
  return <ScrollText size={14} className="text-slate-500 dark:text-slate-400" />
}

export function SystemAuditCard({ data, isLoading, onViewAll, className }: SystemAuditCardProps) {
  const { t } = useTranslation()
  const rows = (data ?? []).slice(0, MAX_PREVIEW_ROWS)

  const actionLabel = (action: string) => t(`admin.dashboard.security.audit.actions.${action}`, { defaultValue: action })

  return (
    <Card
      icon={<ScrollText size={16} />}
      title={t('admin.dashboard.security.audit.title')}
      action={
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          {t('admin.dashboard.security.audit.viewAll')}
        </button>
      }
      className={`flex h-full flex-col ${className ?? ''}`}
    >
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isLoading && rows.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin.dashboard.security.audit.empty')}</p>
      )}
      {!isLoading && rows.length > 0 && (
        <div className="flex-1 overflow-auto">
          <ul className="flex flex-col gap-2">
            {rows.map((entry) => (
              <li key={entry.id} className="flex items-start gap-2 text-xs">
                <span className="mt-0.5 shrink-0">{actionIcon(entry.action)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-700 dark:text-slate-200">{actionLabel(entry.action)}</p>
                  <p className="truncate text-slate-500 dark:text-slate-400">
                    {entry.actor ?? entry.ip ?? '—'} · {new Date(entry.time).toLocaleTimeString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
