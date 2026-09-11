import { useTranslation } from 'react-i18next'
import { TriangleAlert } from 'lucide-react'
import { Card } from '@/components/Card'
import { useAuthStore } from '@/store/authStore'
import { useDateFormat } from '@/hooks/useDateFormat'
import { useInvoiceLimit } from '@/features/billing/hooks/useInvoiceLimit'
import welCardImage from '@/assets/welCard.png'

export function WelcomeCard() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const { formatDateVerbal } = useDateFormat()
  const { isLimitReached } = useInvoiceLimit()

  const today = formatDateVerbal(new Date(), { month: 'long' })

  return (
    <Card className="flex h-full items-center justify-between gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {t('dashboard.demo.greeting', { name: user?.full_name ?? '' })}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{today}</p>
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">{t('dashboard.demo.tagline')}</p>
        {isLimitReached && (
          <div className="mt-2 flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700">
            <TriangleAlert size={16} className="shrink-0 animate-pulse text-amber-500 dark:text-amber-400" />
            {t('dashboard.demo.limitWarning')}
          </div>
        )}
      </div>

      <div className="hidden shrink-0 sm:block">
        <img
          src={welCardImage}
          alt=""
          className="h-44 w-50 rounded-2xl object-cover"
        />
      </div>
    </Card>
  )
}
