import { Fragment, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '@/components/Card'
import { formatCurrency } from '@/utils/formatCurrency'
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

      {data.currency_breakdown.length === 0 ? (
        <span className="text-sm text-slate-400 dark:text-slate-500">—</span>
      ) : (
        <div className="grid grid-cols-[auto_1fr_auto] gap-x-1.5 gap-y-1">
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{t('dashboard.demo.kpi.currency')}</span>
          <span className="text-right text-xs font-medium text-slate-400 dark:text-slate-500">{t('dashboard.demo.kpi.amount')}</span>
          <span className="pl-4 text-right text-xs font-medium text-slate-400 dark:text-slate-500">{t('dashboard.demo.kpi.count')}</span>
          <div className="col-span-3 border-t border-slate-200 dark:border-slate-700" />
          {data.currency_breakdown.map((item) => (
            <Fragment key={item.currency}>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.currency}</span>
              <span className="text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
                {formatCurrency(item.amount)}
              </span>
              <span className="pl-10 text-right text-xs text-slate-500 dark:text-slate-400">
                {t('dashboard.demo.kpi.invoiceCount', { count: item.count })}
              </span>
            </Fragment>
          ))}
        </div>
      )}

      {trend !== null && (
        <div className="flex justify-end">
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
        </div>
      )}
    </Card>
  )
}
