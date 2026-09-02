import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '@/components/Card'
import { CurrencyAmountChips } from './CurrencyAmountChips'
import type { KpiCard as KpiCardData } from '@/features/dashboard/types/dashboard'

interface KpiCardProps {
  title: string
  icon: ReactNode
  data: KpiCardData
}

export function KpiCard({ title, icon, data }: KpiCardProps) {
  const { t } = useTranslation()
  const trend = data.try_amount_trend_pct

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
        <div className="text-indigo-600 dark:text-indigo-400">{icon}</div>
      </div>

      <CurrencyAmountChips breakdown={data.currency_breakdown} emptyLabel="—" size="lg" />

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {t('dashboard.demo.kpi.invoiceCount', { count: data.total_count })}
        </span>
        {trend !== null && (
          <span
            className={
              trend >= 0
                ? 'flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400'
                : 'flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400'
            }
          >
            {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
    </Card>
  )
}
