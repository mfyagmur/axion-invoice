import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminFinancialOverview } from '@/features/admin-dashboard/hooks/useAdminFinancialOverview'
import { useAdminSystemHealth } from '@/features/admin-dashboard/hooks/useAdminSystemHealth'
import { useAdminDeliveryIntegrations } from '@/features/admin-dashboard/hooks/useAdminDeliveryIntegrations'
import { useAdminOperationalMetrics } from '@/features/admin-dashboard/hooks/useAdminOperationalMetrics'
import { RevenueTrendsCard } from '@/features/admin-dashboard/components/RevenueTrendsCard'
import { TotalInvoicedCard } from '@/features/admin-dashboard/components/TotalInvoicedCard'
import { PaymentSuccessRateCard } from '@/features/admin-dashboard/components/PaymentSuccessRateCard'
import { SparklineCountCard } from '@/features/admin-dashboard/components/SparklineCountCard'
import { ApiLatencyChart } from '@/features/admin-dashboard/components/ApiLatencyChart'
import { SystemMetricsColumn } from '@/features/admin-dashboard/components/SystemMetricsColumn'
import { SlowQueriesCard } from '@/features/admin-dashboard/components/SlowQueriesCard'
import { SlowQueryDetailModal } from '@/features/admin-dashboard/components/SlowQueryDetailModal'
import { EmailDeliveryFunnelCard } from '@/features/admin-dashboard/components/EmailDeliveryFunnelCard'
import { GibGatewayStatusCard } from '@/features/admin-dashboard/components/GibGatewayStatusCard'
import { ActiveUsersCard } from '@/features/admin-dashboard/components/ActiveUsersCard'
import { InvoicesTodayCard } from '@/features/admin-dashboard/components/InvoicesTodayCard'
import { PacketUsageCard } from '@/features/admin-dashboard/components/PacketUsageCard'
import { SupportTicketsCard } from '@/features/admin-dashboard/components/SupportTicketsCard'
import type { SlowQueryAlertKey } from '@/features/admin-dashboard/types/adminDashboard'

export function AdminDashboardHomePage() {
  const { t } = useTranslation()
  const financial = useAdminFinancialOverview()
  const systemHealth = useAdminSystemHealth()
  const delivery = useAdminDeliveryIntegrations()
  const operational = useAdminOperationalMetrics()
  const [slowQueryModalTab, setSlowQueryModalTab] = useState<SlowQueryAlertKey | null>(null)

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
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
        <div className="grid flex-1 grid-cols-1 items-stretch gap-4 lg:grid-cols-[2fr_1fr]">
          <ApiLatencyChart
            series={systemHealth.data?.api_latency_series}
            isLoading={systemHealth.isLoading}
            isError={systemHealth.isError}
            onRetry={() => systemHealth.refetch()}
          />
          <div className="flex h-full flex-col gap-4">
            <SystemMetricsColumn data={systemHealth.data} isLoading={systemHealth.isLoading} />
            <SlowQueriesCard
              alerts={systemHealth.data?.slow_query_alerts}
              isLoading={systemHealth.isLoading}
              className="flex-1"
              onSelectAlert={setSlowQueryModalTab}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t('admin.dashboard.delivery.title')}</h1>
        <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-3">
          <EmailDeliveryFunnelCard
            data={delivery.data?.email_funnel}
            isLoading={delivery.isLoading}
            className="sm:col-span-2"
          />
          <div className="flex flex-col gap-3">
            <PacketUsageCard data={operational.data?.packet_usage} isLoading={operational.isLoading} />
            <GibGatewayStatusCard data={delivery.data?.gib_status} isLoading={delivery.isLoading} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t('admin.dashboard.operational.title')}</h1>
        <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-3">
            <ActiveUsersCard data={operational.data?.active_users} isLoading={operational.isLoading} />
            <InvoicesTodayCard data={operational.data?.invoices_created_today} isLoading={operational.isLoading} />
          </div>
          <SupportTicketsCard
            data={operational.data?.support_tickets}
            isLoading={operational.isLoading}
            className="sm:col-span-2"
          />
        </div>
      </section>

      <SlowQueryDetailModal
        isOpen={slowQueryModalTab !== null}
        onClose={() => setSlowQueryModalTab(null)}
        initialTab={slowQueryModalTab ?? 'slow_requests'}
      />
    </div>
  )
}
