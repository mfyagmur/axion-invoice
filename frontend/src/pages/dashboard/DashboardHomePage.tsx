import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { DemoDashboard } from '@/features/dashboard/components/DemoDashboard'

export function DashboardHomePage() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)

  if (user?.is_demo) {
    return <DemoDashboard />
  }

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold text-slate-900">
        {t('dashboard.home.welcome', { name: user?.full_name ?? '' })}
      </h1>
      <p className="text-sm text-slate-500">{t('dashboard.home.subtitle')}</p>
    </div>
  )
}
