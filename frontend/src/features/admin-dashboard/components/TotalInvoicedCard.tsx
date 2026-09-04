import { useTranslation } from 'react-i18next'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '@/components/Card'
import { formatCurrency } from '@/utils/formatCurrency'
import { getCurrencySymbol } from '@/utils/currencySymbol'
import type { CurrencyMtdAmount } from '@/features/admin-dashboard/types/adminDashboard'

const ALL_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP']

interface TotalInvoicedCardProps {
  data: CurrencyMtdAmount[] | undefined
  isLoading: boolean
}

export function TotalInvoicedCard({ data, isLoading }: TotalInvoicedCardProps) {
  const { t } = useTranslation()
  const byCurrency = new Map((data ?? []).map((row) => [row.currency, row]))
  const rows: CurrencyMtdAmount[] = ALL_CURRENCIES.map(
    (currency) => byCurrency.get(currency) ?? { currency, amount: '0', trend_pct: null },
  )

  return (
    <Card className="flex flex-col gap-0.5 p-4 w-fit pr-24">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('admin.dashboard.financial.totalInvoiced')}</h3>
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isLoading &&
        rows.map((row) => (
          <div key={row.currency} className="flex items-center gap-2">
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {getCurrencySymbol(row.currency)}{'\u00A0'}{'\u00A0'}
              {formatCurrency(row.amount)}
            </span>
            {row.trend_pct !== null && (
              <span
                className={
                  row.trend_pct >= 0
                    ? 'flex items-center gap-0.5 text-xs font-medium text-green-600 dark:text-green-400'
                    : 'flex items-center gap-0.5 text-xs font-medium text-red-600 dark:text-red-400'
                }
              >
                {row.trend_pct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(row.trend_pct).toFixed(1)}%
              </span>
            )}
          </div>
        ))}
    </Card>
  )
}
