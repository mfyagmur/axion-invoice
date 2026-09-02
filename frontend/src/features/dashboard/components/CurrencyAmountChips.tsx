import { formatCurrency } from '@/utils/formatCurrency'
import type { CurrencyAmount } from '@/features/dashboard/types/dashboard'

interface CurrencyAmountChipsProps {
  breakdown: CurrencyAmount[]
  emptyLabel: string
  size?: 'sm' | 'lg'
}

export function CurrencyAmountChips({ breakdown, emptyLabel, size = 'sm' }: CurrencyAmountChipsProps) {
  if (breakdown.length === 0) {
    return <span className="text-sm text-slate-400 dark:text-slate-500">{emptyLabel}</span>
  }

  return (
    <div className="flex flex-col gap-0.5">
      {breakdown.map((item) => (
        <span
          key={item.currency}
          className={
            size === 'lg'
              ? 'text-2xl font-semibold text-slate-900 dark:text-slate-100'
              : 'text-sm font-medium text-slate-700 dark:text-slate-300'
          }
        >
          {formatCurrency(item.amount)} {item.currency}
        </span>
      ))}
    </div>
  )
}
