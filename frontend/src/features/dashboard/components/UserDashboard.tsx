import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ErrorState } from '@/components/ErrorState'
import { useDashboardOverview } from '@/features/dashboard/hooks/useDashboardOverview'
import { useDashboardCharts } from '@/features/dashboard/hooks/useDashboardCharts'
import { formatDateForInput } from '@/features/invoices/utils/dateHelpers'
import { WelcomeCard } from './WelcomeCard'
import { QuickActionsCard } from './QuickActionsCard'
import { SupportCard } from './SupportCard'
import { KpiCardGrid } from './KpiCardGrid'
import { DashboardFilters } from './DashboardFilters'
import { InvoiceStatusPieChart } from './InvoiceStatusPieChart'
import { CustomerInvoiceActivityChart } from './CustomerInvoiceActivityChart'
import { InvoiceActivityChart } from './InvoiceActivityChart'
import { PerformanceTrendChart } from './PerformanceTrendChart'
import { CustomerSalesTable } from './CustomerSalesTable'

const BASE_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP']

export function UserDashboard() {
  const { t } = useTranslation()
  const overview = useDashboardOverview()

  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)
  const [currency, setCurrency] = useState('ALL')
  const [granularity, setGranularity] = useState<'daily' | 'monthly'>('monthly')

  const charts = useDashboardCharts({
    currency,
    from: formatDateForInput(dateFrom) || null,
    to: formatDateForInput(dateTo) || null,
    granularity,
  })

  const availableCurrencies = useMemo(() => {
    const codes = new Set<string>(BASE_CURRENCIES)
    for (const item of overview.data?.total.currency_breakdown ?? []) codes.add(item.currency)
    if (currency !== 'ALL') codes.add(currency)
    return Array.from(codes).sort()
  }, [overview.data, currency])

  const handleDateChange = (from: Date | null, to: Date | null) => {
    setDateFrom(from)
    setDateTo(to)
  }

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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-4 flex justify-end">
          <DashboardFilters
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateChange={handleDateChange}
            currency={currency}
            onCurrencyChange={setCurrency}
            availableCurrencies={availableCurrencies}
          />
        </div>
        <div className="lg:col-span-1">
          <InvoiceStatusPieChart
            data={charts.data}
            isLoading={charts.isLoading}
            isError={charts.isError}
            onRetry={() => charts.refetch()}
          />
        </div>
        <div className="lg:col-span-1">
          <CustomerInvoiceActivityChart
            data={charts.data}
            isLoading={charts.isLoading}
            isError={charts.isError}
            onRetry={() => charts.refetch()}
          />
        </div>
        <div className="lg:col-span-2">
          <InvoiceActivityChart
            data={charts.data}
            isLoading={charts.isLoading}
            isError={charts.isError}
            onRetry={() => charts.refetch()}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PerformanceTrendChart
          data={charts.data}
          isLoading={charts.isLoading}
          isError={charts.isError}
          onRetry={() => charts.refetch()}
          granularity={granularity}
          onGranularityChange={setGranularity}
        />
        <CustomerSalesTable
          data={charts.data}
          isLoading={charts.isLoading}
          isError={charts.isError}
          onRetry={() => charts.refetch()}
        />
      </div>
    </div>
  )
}
