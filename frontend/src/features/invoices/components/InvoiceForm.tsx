import { useEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useCustomers } from '@/features/customers/hooks/useCustomers'
import { getInvoiceErrorKey } from '@/features/invoices/getInvoiceErrorKey'
import { useCreateInvoice } from '@/features/invoices/hooks/useCreateInvoice'
import { LineItemCard } from '@/features/invoices/components/LineItemCard'
import { useTemplate } from '@/features/invoice-editor/hooks/useTemplate'
import { useTemplates } from '@/features/invoice-editor/hooks/useTemplates'
import type { FieldType } from '@/types/template'

export interface InvoiceFormValues {
  template_id: string
  customer_id: string
  currency: string
  field_values: Record<string, string>
  line_items: {
    item_code: string
    description: string
    quantity: number
    unit_price: number
    discount_rate: number
    tax_rate: number
    other_tax_amount: number
  }[]
  issued_at: string
  due_at: string
}

function inputTypeFor(fieldType: FieldType): string {
  if (fieldType === 'date') return 'date'
  if (fieldType === 'number' || fieldType === 'currency') return 'number'
  return 'text'
}

function emptyLineItem() {
  return {
    item_code: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    discount_rate: 0,
    tax_rate: 0,
    other_tax_amount: 0,
  }
}

export function InvoiceForm() {
  const { t } = useTranslation()
  const { data: templates } = useTemplates()
  const { data: customers } = useCustomers()
  const createInvoice = useCreateInvoice()
  const [expandedIndexes, setExpandedIndexes] = useState<Set<number>>(new Set([0]))

  const { register, control, handleSubmit, watch, setValue } = useForm<InvoiceFormValues>({
    defaultValues: {
      currency: 'TRY',
      field_values: {},
      line_items: [emptyLineItem()],
    },
  })

  const { fields: lineItemFields, append, remove } = useFieldArray({ control, name: 'line_items' })

  const templateId = watch('template_id')
  const lineItems = useWatch({ control, name: 'line_items' })

  const { data: template } = useTemplate(templateId || undefined)

  const lineComputations = useMemo(
    () =>
      lineItems.map((item) => {
        const gross = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0)
        const discountAmount = gross * ((Number(item.discount_rate) || 0) / 100)
        const taxableBase = gross - discountAmount
        const taxAmount = taxableBase * ((Number(item.tax_rate) || 0) / 100)
        const otherTax = Number(item.other_tax_amount) || 0
        return { taxableBase, discountAmount, taxAmount, lineTotal: taxableBase + taxAmount + otherTax }
      }),
    [lineItems],
  )

  const subtotal = useMemo(
    () => lineComputations.reduce((sum, computed) => sum + computed.taxableBase, 0),
    [lineComputations],
  )
  const taxTotal = useMemo(
    () =>
      lineComputations.reduce(
        (sum, computed, index) => sum + computed.taxAmount + (Number(lineItems[index]?.other_tax_amount) || 0),
        0,
      ),
    [lineComputations, lineItems],
  )
  const grandTotal = subtotal + taxTotal

  useEffect(() => {
    if (template) {
      setValue('field_values', {})
    }
  }, [template, setValue])

  function toggleExpand(index: number) {
    setExpandedIndexes((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  function handleAppend() {
    append(emptyLineItem())
    setExpandedIndexes((prev) => new Set(prev).add(lineItemFields.length))
  }

  const onSubmit = handleSubmit((values) => {
    createInvoice.mutate({
      template_id: values.template_id,
      customer_id: values.customer_id,
      currency: values.currency,
      field_values: values.field_values,
      line_items: values.line_items.map((item) => ({
        item_code: item.item_code || undefined,
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        discount_rate: Number(item.discount_rate) || 0,
        tax_rate: Number(item.tax_rate) || 0,
        other_tax_amount: Number(item.other_tax_amount) || 0,
      })),
      issued_at: values.issued_at || undefined,
      due_at: values.due_at || undefined,
    })
  })

  return (
    <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {t('invoices.form.template')}
        </label>
        <select
          {...register('template_id', { required: true })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">{t('invoices.form.selectTemplate')}</option>
          {templates?.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">{t('invoices.form.customer')}</label>
        <select
          {...register('customer_id', { required: true })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">{t('invoices.form.selectCustomer')}</option>
          {customers?.filter((customer) => customer.is_active).map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>

      {template && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-900">{t('invoices.form.fields')}</h3>
          {template.fields.map((field) =>
            field.is_computed ? (
              <div key={field.id} className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700">{field.label}</span>
                <span className="text-sm text-slate-500">
                  {field.field_key === 'subtotal' ? subtotal.toFixed(2) : taxTotal.toFixed(2)}{' '}
                  ({t('invoices.form.computed')})
                </span>
              </div>
            ) : (
              <Input
                key={field.id}
                label={field.label}
                type={inputTypeFor(field.field_type)}
                {...register(`field_values.${field.field_key}` as const)}
              />
            ),
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">{t('invoices.form.lineItems')}</h3>
          <Button type="button" variant="secondary" onClick={handleAppend}>
            {t('invoices.form.addLineItem')}
          </Button>
        </div>

        {lineItemFields.map((field, index) => (
          <LineItemCard
            key={field.id}
            index={index}
            register={register}
            computed={lineComputations[index] ?? { discountAmount: 0, taxAmount: 0, lineTotal: 0 }}
            expanded={expandedIndexes.has(index)}
            onToggleExpand={() => toggleExpand(index)}
            onRemove={() => remove(index)}
            removeDisabled={lineItemFields.length === 1}
          />
        ))}
      </div>

      <div className="flex flex-col gap-1 rounded-md bg-slate-50 p-4 text-sm">
        <div className="flex justify-between">
          <span>{t('invoices.form.subtotal')}</span>
          <span>{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>{t('invoices.form.tax')}</span>
          <span>{taxTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>{t('invoices.form.grandTotal')}</span>
          <span>{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {createInvoice.isError && (
        <p className="text-sm text-red-600">
          {t(getInvoiceErrorKey(createInvoice.error))}{' '}
          <Link to="/dashboard/billing" className="underline">
            {t('nav.billing')}
          </Link>
        </p>
      )}

      <Button type="submit" disabled={createInvoice.isPending}>
        {t('invoices.form.submit')}
      </Button>
    </form>
  )
}
