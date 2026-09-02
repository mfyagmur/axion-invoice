import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/Button'
import { useAuthStore } from '@/store/authStore'

export function DashboardWelcomeHeader() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const today = new Date().toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t('dashboard.demo.overview')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{today}</p>
        <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('dashboard.demo.greeting', { name: user?.full_name ?? '' })}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="primary" onClick={() => navigate('/dashboard/invoices/new')}>
          <ChevronRight size={16} className="mr-2" />
          {t('dashboard.demo.newInvoice')}
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate('/dashboard/customers', { state: { openNewCustomerModal: true } })}
        >
          <ChevronRight size={16} className="mr-2" />
          {t('dashboard.demo.newCustomer')}
        </Button>
      </div>
    </div>
  )
}
