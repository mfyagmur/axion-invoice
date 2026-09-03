import { useTranslation } from 'react-i18next'
import { ErrorState } from '@/components/ErrorState'
import { useDashboardOverview } from '@/features/dashboard/hooks/useDashboardOverview'
import { WelcomeCard } from './WelcomeCard'
import { QuickActionsCard } from './QuickActionsCard'
import { SupportCard } from './SupportCard'
import { KpiCardGrid } from './KpiCardGrid'

export function UserDashboard() {
  const { t } = useTranslation()
  const overview = useDashboardOverview()

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <WelcomeCard />
        </div>
        <div className="lg:col-span-1">
          <QuickActionsCard />
        </div>
        <div className="lg:col-span-1">
          <SupportCard />
        </div>
      </div>

      {overview.isError && <ErrorState onRetry={() => overview.refetch()} />}
      {!overview.isError && overview.isLoading && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>
      )}
      {!overview.isError && overview.data && <KpiCardGrid overview={overview.data} />}
    </div>
  )
}
