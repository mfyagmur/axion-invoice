import type { UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Trash2 } from 'lucide-react'
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
  currency: string
  onRemove: () => void
  removeDisabled: boolean
  fieldErrors?: { item_code?: { message?: string }; description?: { message?: string } }
}

const UNIT_OPTIONS = [
  { value: 'adet', label: 'Adet' },
  { value: 'koli', label: 'Koli' },
  { value: 'paket', label: 'Paket' },
  { value: 'saat', label: 'Saat' },
  { value: 'gun', label: 'Gün' },
  { value: 'hafta', label: 'Hafta' },
  { value: 'ay', label: 'Ay' },
]

export function LineItemCard({
  index,
  register,
  computed,
  currency,
  onRemove,
  removeDisabled,
  fieldErrors,
}: LineItemCardProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-md border border-slate-300 bg-white p-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs font-medium text-slate-500">{t('invoices.form.rowNumber')} {index + 1}</div>
        <button
          type="button"
          onClick={onRemove}
          disabled={removeDisabled}
          aria-label={t('invoices.form.removeLineItem')}
          className="flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2">
        <Input
          hideLabel
          label={t('invoices.form.itemCode')}
          placeholder={t('invoices.form.itemCode')}
          maxLength={255}
          error={fieldErrors?.item_code ? t('invoices.form.errors.itemCodeRequired') : undefined}
          {...register(`line_items.${index}.item_code` as const, { required: true })}
        />

        <Input
          hideLabel
          label={t('invoices.form.description')}
          placeholder={t('invoices.form.description')}
          maxLength={255}
          error={fieldErrors?.description ? t('invoices.form.errors.descriptionRequired') : undefined}
          {...register(`line_items.${index}.description` as const, { required: true })}
        />
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <div className="flex items-stretch rounded-md border border-slate-300 bg-white overflow-hidden">
          <label className="sr-only">{t('invoices.form.quantity')}</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder={t('invoices.form.quantity')}
            className="w-20 border-0 px-3 py-2 text-sm focus:outline-none focus:ring-0 placeholder-slate-400"
            aria-label={t('invoices.form.quantity')}
            {...register(`line_items.${index}.quantity` as const, { required: true, valueAsNumber: true })}
          />
          <div className="w-px bg-slate-300" />
          <div className="relative flex-1">
            <select
              className="h-full w-full appearance-none border-0 bg-transparent py-2 pl-3 pr-7 text-sm text-slate-700 focus:outline-none focus:ring-0"
              {...register(`line_items.${index}.unit` as const)}
            >
              {UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="relative flex-1 min-w-37.5">
          <label className="sr-only">{t('invoices.form.unitPrice')}</label>
          <input
            type="number"
            step="0.01"
            placeholder={t('invoices.form.unitPrice')}
            className="w-full rounded-md border-0 bg-slate-100 px-3 py-2 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300 placeholder-slate-400"
            aria-label={t('invoices.form.unitPrice')}
            {...register(`line_items.${index}.unit_price` as const, { required: true, valueAsNumber: true })}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{currency}</span>
        </div>

        <div className="relative flex-1 min-w-37.5">
          <label className="sr-only">{t('invoices.form.discountRate')}</label>
          <input
            type="number"
            step="0.01"
            placeholder={t('invoices.form.discountRate')}
            className="w-full rounded-md border-0 bg-slate-100 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300 placeholder-slate-400"
            aria-label={t('invoices.form.discountRate')}
            {...register(`line_items.${index}.discount_rate` as const, { valueAsNumber: true })}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
        </div>

        <div className="relative flex-1 min-w-30">
          <label className="sr-only">{t('invoices.form.taxRate')}</label>
          <input
            type="number"
            step="0.01"
            placeholder={t('invoices.form.taxRate')}
            className="w-full rounded-md border-0 bg-slate-100 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300 placeholder-slate-400"
            aria-label={t('invoices.form.taxRate')}
            {...register(`line_items.${index}.tax_rate` as const, { valueAsNumber: true })}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
        </div>

        <div className="relative flex-1 min-w-37.5">
          <label className="sr-only">{t('invoices.form.otherTaxes')}</label>
          <input
            type="number"
            step="0.01"
            placeholder={t('invoices.form.otherTaxes')}
            className="w-full rounded-md border-0 bg-slate-100 px-3 py-2 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300 placeholder-slate-400"
            aria-label={t('invoices.form.otherTaxes')}
            {...register(`line_items.${index}.other_tax_amount` as const, { valueAsNumber: true })}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{currency}</span>
        </div>

        <div className="relative flex-1 min-w-35">
          <label className="sr-only">{t('invoices.form.discountAmount')}</label>
          <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-500 h-10 flex items-center">
            {computed.discountAmount.toFixed(2)}
          </div>
        </div>

        <div className="relative flex-1 min-w-35">
          <label className="sr-only">{t('invoices.form.taxAmount')}</label>
          <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-500 h-10 flex items-center">
            {computed.taxAmount.toFixed(2)}
          </div>
        </div>

        <div className="relative flex-1 min-w-35">
          <label className="sr-only">{t('invoices.form.amount')}</label>
          <div className="flex flex-col justify-center rounded-md bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 h-10">
            <span>{computed.lineTotal.toFixed(2)}</span>
            <span className="text-xs text-slate-500">{currency}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
