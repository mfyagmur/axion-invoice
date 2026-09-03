import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ErrorState } from '@/components/ErrorState'
import { useAuthStore } from '@/store/authStore'
import { useDashboardOverview } from '@/features/dashboard/hooks/useDashboardOverview'
import { useDashboardCharts } from '@/features/dashboard/hooks/useDashboardCharts'
import { formatDateForInput } from '@/features/invoices/utils/dateHelpers'
import { DashboardWelcomeHeader } from './DashboardWelcomeHeader'
import { KpiCardGrid } from './KpiCardGrid'
import { DashboardFilters } from './DashboardFilters'
import { InvoiceStatusDonutChart } from './InvoiceStatusDonutChart'
import { InvoiceActivityChart } from './InvoiceActivityChart'
import { RecentInvoicesTable } from './RecentInvoicesTable'
import { TopCustomersTable } from './TopCustomersTable'

const BASE_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP']

export function DemoDashboard() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)

  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)
  const [currency, setCurrency] = useState(user?.default_currency ?? 'TRY')

  const overview = useDashboardOverview()
  const charts = useDashboardCharts({
    currency,
    from: formatDateForInput(dateFrom) || null,
    to: formatDateForInput(dateTo) || null,
  })

  const availableCurrencies = useMemo(() => {
    const codes = new Set<string>(BASE_CURRENCIES)
    for (const item of overview.data?.total.currency_breakdown ?? []) codes.add(item.currency)
    codes.add(currency)
    return Array.from(codes).sort()
  }, [overview.data, currency])

  const handleDateChange = (from: Date | null, to: Date | null) => {
    setDateFrom(from)
    setDateTo(to)
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardWelcomeHeader />

      {overview.isError && <ErrorState onRetry={() => overview.refetch()} />}
      {!overview.isError && overview.isLoading && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>
      )}
      {!overview.isError && overview.data && <KpiCardGrid overview={overview.data} />}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-3">
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
          <InvoiceStatusDonutChart
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

      {overview.data && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentInvoicesTable invoices={overview.data.recent_invoices} />
          </div>
          <div className="lg:col-span-1">
            <TopCustomersTable customers={overview.data.top_customers} />
          </div>
        </div>
      )}
    </div>
  )
}
