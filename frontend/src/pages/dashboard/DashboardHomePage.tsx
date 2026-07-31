import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'

export function DashboardHomePage() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold text-slate-900">
        {t('dashboard.home.welcome', { name: user?.full_name ?? '' })}
      </h1>
      <p className="text-sm text-slate-500">{t('dashboard.home.subtitle')}</p>
    </div>
  )
}
