import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/Modal'
import type { AuditLogEntry } from '@/features/admin-dashboard/types/adminDashboard'

interface AuditLogDetailModalProps {
  isOpen: boolean
  onClose: () => void
  data: AuditLogEntry[] | undefined
  isLoading: boolean
}

export function AuditLogDetailModal({ isOpen, onClose, data, isLoading }: AuditLogDetailModalProps) {
  const { t } = useTranslation()
  const rows = data ?? []

  if (!isOpen) {
    return null
  }

  const actionLabel = (action: string) => t(`admin.dashboard.security.audit.actions.${action}`, { defaultValue: action })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('admin.dashboard.security.audit.modalTitle')} size="xl">
      <div className="flex h-full flex-col gap-2 overflow-y-auto">
        {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
        {!isLoading && rows.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin.dashboard.security.audit.empty')}</p>
        )}
        {!isLoading && rows.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="pb-2 pr-3 font-medium">{t('admin.dashboard.security.loginActivities.time')}</th>
                <th className="pb-2 pr-3 font-medium">Action</th>
                <th className="pb-2 pr-3 font-medium">{t('admin.dashboard.security.loginActivities.user')}</th>
                <th className="pb-2 pr-3 font-medium">{t('admin.dashboard.security.loginActivities.ip')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="py-2 pr-3 text-slate-500 dark:text-slate-400">{new Date(entry.time).toLocaleString()}</td>
                  <td className="py-2 pr-3 text-slate-700 dark:text-slate-200">{actionLabel(entry.action)}</td>
                  <td className="py-2 pr-3 text-slate-600 dark:text-slate-300">{entry.actor ?? '—'}</td>
                  <td className="py-2 pr-3 text-slate-500 dark:text-slate-400">{entry.ip ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Modal>
  )
}
