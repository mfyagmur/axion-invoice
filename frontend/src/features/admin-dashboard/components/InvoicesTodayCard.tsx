import { useTranslation } from 'react-i18next'
import { Card } from '@/components/Card'
import { formatCurrency } from '@/utils/formatCurrency'
import { getCurrencySymbol } from '@/utils/currencySymbol'
import type { InvoicesTodayStat } from '@/features/admin-dashboard/types/adminDashboard'

const ALL_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP']

interface InvoicesTodayCardProps {
  data: InvoicesTodayStat | undefined
  isLoading: boolean
}

export function InvoicesTodayCard({ data, isLoading }: InvoicesTodayCardProps) {
  const { t } = useTranslation()
  const byCurrency = new Map((data?.by_currency ?? []).map((row) => [row.currency, row]))
  const rows = ALL_CURRENCIES.map((currency) => byCurrency.get(currency) ?? { currency, amount: '0', count: 0 })

  return (
    <Card title={t('admin.dashboard.operational.invoicesToday.title')} className="flex flex-col gap-1 p-4">
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isLoading && data !== undefined && (
        <div className="flex items-start gap-18 mt-1">
          <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{data.count}</span>
          <div className="flex flex-col gap-0.5">
            {rows.map((row) => (
              <div key={row.currency} className="flex items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                <span>
                  {getCurrencySymbol(row.currency)} {formatCurrency(row.amount)}
                </span>
                <span>{row.count} {t('admin.dashboard.operational.invoicesToday.unit')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
