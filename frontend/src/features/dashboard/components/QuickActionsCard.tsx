import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, FileText, LayoutTemplate, UserPlus } from 'lucide-react'
import { Card } from '@/components/Card'

export function QuickActionsCard() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const actions = [
    { label: t('dashboard.demo.newInvoice'), icon: FileText, onClick: () => navigate('/dashboard/invoices/new') },
    {
      label: t('dashboard.demo.newCustomer'),
      icon: UserPlus,
      onClick: () => navigate('/dashboard/customers', { state: { openNewCustomerModal: true } }),
    },
    { label: t('dashboard.demo.newTemplate'), icon: LayoutTemplate, onClick: () => navigate('/dashboard/templates/new') },
  ]

  return (
    <Card title={t('dashboard.demo.quickActions.title')} className="h-full">
      <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex cursor-pointer items-center gap-3 py-3 text-left text-sm font-medium text-slate-700 first:pt-0 last:pb-0 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
          >
            <action.icon size={18} className="text-indigo-500 dark:text-indigo-400" />
            {action.label}
            <ChevronRight size={16} className="ml-auto text-slate-300 dark:text-slate-600" />
          </button>
        ))}
      </div>
    </Card>
  )
}
