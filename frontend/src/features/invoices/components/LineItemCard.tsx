import type { UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import type { InvoiceFormValues } from '@/features/invoices/components/InvoiceForm'

interface LineItemComputed {
  discountAmount: number
  taxAmount: number
  lineTotal: number
}

interface LineItemCardProps {
  index: number
  register: UseFormRegister<InvoiceFormValues>
  computed: LineItemComputed
  expanded: boolean
  onToggleExpand: () => void
  onRemove: () => void
  removeDisabled: boolean
}

export function LineItemCard({
  index,
  register,
  computed,
  expanded,
  onToggleExpand,
  onRemove,
  removeDisabled,
}: LineItemCardProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-md border border-slate-300">
      <button
        type="button"
        onClick={onToggleExpand}
        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium text-slate-900"
      >
        <span>
          {t('invoices.form.rowNumber')} {index + 1}
        </span>
        <span className="flex items-center gap-3 text-slate-500">
          <span>{computed.lineTotal.toFixed(2)}</span>
          <span>{expanded ? '▲' : '▼'}</span>
        </span>
      </button>
      {expanded && (
        <div className="flex flex-col gap-3 border-t border-slate-200 p-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('invoices.form.itemCode')} {...register(`line_items.${index}.item_code` as const)} />
            <Input
              label={t('invoices.form.description')}
              {...register(`line_items.${index}.description` as const, { required: true })}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label={t('invoices.form.quantity')}
              type="number"
              step="0.01"
              {...register(`line_items.${index}.quantity` as const, { required: true, valueAsNumber: true })}
            />
            <Input
              label={t('invoices.form.unitPrice')}
              type="number"
              step="0.01"
              {...register(`line_items.${index}.unit_price` as const, { required: true, valueAsNumber: true })}
            />
            <Input
              label={t('invoices.form.otherTaxes')}
              type="number"
              step="0.01"
              {...register(`line_items.${index}.other_tax_amount` as const, { valueAsNumber: true })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('invoices.form.discountRate')}
              type="number"
              step="0.01"
              {...register(`line_items.${index}.discount_rate` as const, { valueAsNumber: true })}
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-slate-700">{t('invoices.form.discountAmount')}</span>
              <span className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-500">
                {computed.discountAmount.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('invoices.form.taxRate')}
              type="number"
              step="0.01"
              {...register(`line_items.${index}.tax_rate` as const, { valueAsNumber: true })}
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-slate-700">{t('invoices.form.taxAmount')}</span>
              <span className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-500">
                {computed.taxAmount.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="ghost" onClick={onRemove} disabled={removeDisabled}>
              {t('invoices.form.removeLineItem')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
