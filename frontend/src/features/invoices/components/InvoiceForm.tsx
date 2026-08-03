import { useEffect, useMemo } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useCustomers } from '@/features/customers/hooks/useCustomers'
import { getInvoiceErrorKey } from '@/features/invoices/getInvoiceErrorKey'
import { useCreateInvoice } from '@/features/invoices/hooks/useCreateInvoice'
import { useTemplate } from '@/features/invoice-editor/hooks/useTemplate'
import { useTemplates } from '@/features/invoice-editor/hooks/useTemplates'
import type { FieldType } from '@/types/template'

interface InvoiceFormValues {
  template_id: string
  customerMode: 'existing' | 'new'
  customer_id: string
  newCustomerName: string
  newCustomerEmail: string
  currency: string
  tax_total: number
  field_values: Record<string, string>
  line_items: { description: string; quantity: number; unit_price: number }[]
  issued_at: string
  due_at: string
}

function inputTypeFor(fieldType: FieldType): string {
  if (fieldType === 'date') return 'date'
  if (fieldType === 'number' || fieldType === 'currency') return 'number'
  return 'text'
}

export function InvoiceForm() {
  const { t } = useTranslation()
  const { data: templates } = useTemplates()
  const { data: customers } = useCustomers()
  const createInvoice = useCreateInvoice()

  const { register, control, handleSubmit, watch, setValue } = useForm<InvoiceFormValues>({
    defaultValues: {
      customerMode: 'existing',
      currency: 'TRY',
      tax_total: 0,
      field_values: {},
      line_items: [{ description: '', quantity: 1, unit_price: 0 }],
    },
  })

  const { fields: lineItemFields, append, remove } = useFieldArray({ control, name: 'line_items' })

  const templateId = watch('template_id')
  const customerMode = watch('customerMode')
  const taxTotal = watch('tax_total')
  const lineItems = watch('line_items')

  const { data: template } = useTemplate(templateId || undefined)

  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0),
    [lineItems],
  )
  const grandTotal = subtotal + (Number(taxTotal) || 0)

  useEffect(() => {
    if (template) {
      setValue('field_values', {})
    }
  }, [template, setValue])

  const onSubmit = handleSubmit((values) => {
    createInvoice.mutate({
      template_id: values.template_id,
      customer_id: values.customerMode === 'existing' ? values.customer_id : undefined,
      customer:
        values.customerMode === 'new'
          ? { name: values.newCustomerName, email: values.newCustomerEmail || undefined }
          : undefined,
      currency: values.currency,
      tax_total: Number(values.tax_total) || 0,
      field_values: values.field_values,
      line_items: values.line_items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
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
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1">
            <input type="radio" value="existing" {...register('customerMode')} />
            {t('invoices.form.existingCustomer')}
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" value="new" {...register('customerMode')} />
            {t('invoices.form.newCustomer')}
          </label>
        </div>

        {customerMode === 'existing' ? (
          <select
            {...register('customer_id', { required: customerMode === 'existing' })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">{t('invoices.form.selectCustomer')}</option>
            {customers?.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex gap-3">
            <Input
              label={t('customers.form.name')}
              {...register('newCustomerName', { required: customerMode === 'new' })}
            />
            <Input label={t('customers.form.email')} type="email" {...register('newCustomerEmail')} />
          </div>
        )}
      </div>

      {template && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-900">{t('invoices.form.fields')}</h3>
          {template.fields.map((field) =>
            field.is_computed ? (
              <div key={field.id} className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700">{field.label}</span>
                <span className="text-sm text-slate-500">
                  {field.field_key === 'subtotal' ? subtotal.toFixed(2) : Number(taxTotal || 0).toFixed(2)}{' '}
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
          <Button
            type="button"
            variant="secondary"
            onClick={() => append({ description: '', quantity: 1, unit_price: 0 })}
          >
            {t('invoices.form.addLineItem')}
          </Button>
        </div>

        {lineItemFields.map((field, index) => (
          <div key={field.id} className="flex items-end gap-2">
            <Input
              label={t('invoices.form.description')}
              className="flex-1"
              {...register(`line_items.${index}.description` as const, { required: true })}
            />
            <Input
              label={t('invoices.form.quantity')}
              type="number"
              step="0.01"
              className="w-24"
              {...register(`line_items.${index}.quantity` as const, { required: true, valueAsNumber: true })}
            />
            <Input
              label={t('invoices.form.unitPrice')}
              type="number"
              step="0.01"
              className="w-28"
              {...register(`line_items.${index}.unit_price` as const, { required: true, valueAsNumber: true })}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => remove(index)}
              disabled={lineItemFields.length === 1}
            >
              {t('invoices.form.removeLineItem')}
            </Button>
          </div>
        ))}
      </div>

      <Input
        label={t('invoices.form.taxTotal')}
        type="number"
        step="0.01"
        className="max-w-xs"
        {...register('tax_total', { valueAsNumber: true })}
      />

      <div className="flex flex-col gap-1 rounded-md bg-slate-50 p-4 text-sm">
        <div className="flex justify-between">
          <span>{t('invoices.form.subtotal')}</span>
          <span>{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>{t('invoices.form.tax')}</span>
          <span>{(Number(taxTotal) || 0).toFixed(2)}</span>
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
