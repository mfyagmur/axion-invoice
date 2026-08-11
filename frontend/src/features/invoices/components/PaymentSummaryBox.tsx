import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { Card } from '@/components/Card'
import { formatCurrency } from '@/utils/formatCurrency'

interface PaymentSummaryBoxProps {
  grandTotal: string
  subtotal: string
  taxTotal: string
  currency: string
}

export function PaymentSummaryBox({ grandTotal, subtotal, taxTotal, currency }: PaymentSummaryBoxProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="flex w-full items-center justify-between rounded-md px-1 py-1 text-left transition-colors hover:bg-slate-50"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">{t('invoices.form.amountToBeCharged')}</span>
            <span className="text-lg font-semibold text-slate-900">
              {formatCurrency(grandTotal)} {currency}
            </span>
          </div>
          <ChevronDown
            size={16}
            className={twMerge('shrink-0 text-slate-600 transition-transform', isOpen && 'rotate-180')}
          />
        </button>

        <div
          className={twMerge(
            'grid transition-[grid-template-rows] duration-300 ease-in-out',
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-600">{t('invoices.form.subtotal')}</span>
                <span className="text-slate-900">
                  {formatCurrency(subtotal)} {currency}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-600">{t('invoices.form.tax')}</span>
                <span className="text-slate-900">
                  {formatCurrency(taxTotal)} {currency}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-t border-slate-200 pt-3">
                <span className="text-xs font-semibold text-slate-900">{t('invoices.form.grandTotal')}</span>
                <span className="text-sm font-semibold text-slate-900">
                  {formatCurrency(grandTotal)} {currency}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
