import { useTranslation } from 'react-i18next'
import { useAdminFinancialOverview } from '@/features/admin-dashboard/hooks/useAdminFinancialOverview'
import { useAdminSystemHealth } from '@/features/admin-dashboard/hooks/useAdminSystemHealth'
import { RevenueTrendsCard } from '@/features/admin-dashboard/components/RevenueTrendsCard'
import { TotalInvoicedCard } from '@/features/admin-dashboard/components/TotalInvoicedCard'
import { PaymentSuccessRateCard } from '@/features/admin-dashboard/components/PaymentSuccessRateCard'
import { SparklineCountCard } from '@/features/admin-dashboard/components/SparklineCountCard'
import { ApiLatencyChart } from '@/features/admin-dashboard/components/ApiLatencyChart'
import { SystemMetricsColumn } from '@/features/admin-dashboard/components/SystemMetricsColumn'
import { SlowQueriesCard } from '@/features/admin-dashboard/components/SlowQueriesCard'

export function AdminDashboardHomePage() {
  const { t } = useTranslation()
  const financial = useAdminFinancialOverview()
  const systemHealth = useAdminSystemHealth()

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[3fr_2fr]">
      <section className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t('admin.dashboard.financial.title')}</h1>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <RevenueTrendsCard
              trend={financial.data?.revenue_trend}
              isLoading={financial.isLoading}
              isError={financial.isError}
              onRetry={() => financial.refetch()}
            />
          </div>
          <div className="flex flex-col gap-3 sm:row-span-2">
            <TotalInvoicedCard data={financial.data?.total_invoiced_mtd} isLoading={financial.isLoading} />
            <PaymentSuccessRateCard data={financial.data?.payment_success_rate} isLoading={financial.isLoading} />
          </div>
          <SparklineCountCard
            title={t('admin.dashboard.financial.paidInvoices')}
            caption={t('admin.dashboard.financial.paidInvoicesCaption')}
            data={financial.data?.paid_invoices_mtd}
            isLoading={financial.isLoading}
            color="#3b82f6"
          />
          <SparklineCountCard
            title={t('admin.dashboard.financial.overdueInvoices')}
            caption={t('admin.dashboard.financial.overdueInvoicesCaption')}
            data={financial.data?.overdue_invoices}
            isLoading={financial.isLoading}
            color="#ef4444"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t('admin.dashboard.system.title')}</h1>
        <div className="grid grid-cols-1 gap-4">
          <ApiLatencyChart
            series={systemHealth.data?.api_latency_series}
            isLoading={systemHealth.isLoading}
            isError={systemHealth.isError}
            onRetry={() => systemHealth.refetch()}
          />
          <SystemMetricsColumn data={systemHealth.data} isLoading={systemHealth.isLoading} />
          <SlowQueriesCard alerts={systemHealth.data?.slow_query_alerts} isLoading={systemHealth.isLoading} />
        </div>
      </section>
    </div>
  )
}
