import { useTranslation } from 'react-i18next'
import { User2 } from 'lucide-react'
import { Card } from '@/components/Card'
import type { SupportTicket } from '@/features/admin-dashboard/types/adminDashboard'

interface SupportTicketsCardProps {
  data: SupportTicket[] | undefined
  isLoading: boolean
  className?: string
}

export function SupportTicketsCard({ data, isLoading, className }: SupportTicketsCardProps) {
  const { t } = useTranslation()

  return (
    <Card title={t('admin.dashboard.operational.supportTickets.title')} className={className}>
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isLoading && data && data.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin.dashboard.operational.supportTickets.empty')}</p>
      )}
      {!isLoading && data && data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="pb-2 pr-3 font-medium">{t('admin.dashboard.operational.supportTickets.user')}</th>
                <th className="pb-2 pr-3 font-medium">{t('admin.dashboard.operational.supportTickets.issue')}</th>
                <th className="pb-2 font-medium">{t('admin.dashboard.operational.supportTickets.priority')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((ticket, index) => (
                <tr key={`${ticket.user_name}-${index}`} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <User2 size={13} />
                      </span>
                      {ticket.user_name}
                    </div>
                  </td>
                  <td className="py-2 pr-3 text-slate-600 dark:text-slate-300">{ticket.issue}</td>
                  <td className="py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        ticket.priority === 'priority'
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {ticket.priority === 'priority'
                        ? t('admin.dashboard.operational.supportTickets.priority')
                        : t('admin.dashboard.operational.supportTickets.notPriority')}
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
