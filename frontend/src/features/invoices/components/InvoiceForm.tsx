import { useEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Banknote, FileStack, Plus, Send, User } from 'lucide-react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { useCustomer } from '@/features/customers/hooks/useCustomer'
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
  payment_currency: string
  invoice_type: 'sale' | 'purchase'
  scenario: 'commercial'
  commission_payer: 'self' | 'customer'
  recipient_contact_ids: string[]
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

const CURRENCY_OPTIONS = ['TRY', 'USD', 'EUR', 'GBP']

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
      template_id: '',
      customer_id: '',
      currency: 'TRY',
      payment_currency: 'TRY',
      invoice_type: 'sale' as const,
      scenario: 'commercial' as const,
      commission_payer: 'self' as const,
      recipient_contact_ids: [],
      field_values: {},
      line_items: [emptyLineItem()],
      issued_at: '',
      due_at: '',
    },
  })

  const { fields: lineItemFields, append, remove } = useFieldArray({ control, name: 'line_items' })

  const templateId = watch('template_id')
  const customerId = watch('customer_id')
  const lineItems = useWatch({ control, name: 'line_items' })
  const currency = watch('currency')
  const paymentCurrency = watch('payment_currency')

  const { data: template } = useTemplate(templateId || undefined)
  const { data: selectedCustomer } = useCustomer(customerId || undefined)

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

  const isFormValid = !!(templateId && customerId && lineItemFields.length > 0)

  useEffect(() => {
    if (template) {
      setValue('field_values', {})
    }
  }, [template, setValue])

  useEffect(() => {
    setValue('recipient_contact_ids', [])
  }, [customerId, setValue])

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
      payment_currency: values.payment_currency,
      invoice_type: values.invoice_type,
      scenario: values.scenario,
      commission_payer: values.commission_payer,
      recipient_contact_ids: values.recipient_contact_ids.filter((id) => !!id),
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
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <div className="flex flex-col gap-6">
        <Card icon={<FileStack size={20} />} title={t('invoices.form.template')}>
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
        </Card>

        <Card icon={<User size={20} />} title={t('invoices.form.invoiceDetails')}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {t('invoices.form.companyName')}
                </label>
                <select
                  {...register('customer_id', { required: true })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">{t('invoices.form.selectCustomer')}</option>
                  {customers?.filter((customer) => customer.is_active).map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.company_name || customer.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomer && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    {t('invoices.form.recipientContact')}
                  </label>
                  <select
                    {...register('recipient_contact_ids.0')}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">{t('invoices.form.customerInfoOption')}</option>
                    {selectedCustomer.contacts?.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {selectedCustomer && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t('invoices.form.additionalContact1')}</label>
                  <select
                    {...register('recipient_contact_ids.1')}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">{t('invoices.form.customerInfoOption')}</option>
                    {selectedCustomer.contacts?.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t('invoices.form.additionalContact2')}</label>
                  <select
                    {...register('recipient_contact_ids.2')}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">{t('invoices.form.customerInfoOption')}</option>
                    {selectedCustomer.contacts?.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card icon={<Banknote size={20} />} title={t('invoices.form.paymentDetails')}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {t('invoices.form.paymentCurrency')}
                </label>
                <select
                  {...register('payment_currency')}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  {CURRENCY_OPTIONS.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {t('invoices.form.invoiceCurrency')}
                </label>
                <select
                  {...register('currency')}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  {CURRENCY_OPTIONS.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <fieldset className="border-t border-slate-200 pt-4">
              <legend className="mb-3 text-sm font-medium text-slate-700">{t('invoices.form.commissionPayer')}</legend>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" {...register('commission_payer')} value="self" className="rounded" />
                  <span className="text-sm text-slate-700">{t('invoices.form.commissionPayerSelf')}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" {...register('commission_payer')} value="customer" className="rounded" />
                  <span className="text-sm text-slate-700">{t('invoices.form.commissionPayerCustomer')}</span>
                </label>
              </div>
            </fieldset>

            <div className="grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {t('invoices.form.invoiceType')}
                </label>
                <select
                  {...register('invoice_type')}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="sale">{t('invoices.form.invoiceTypeSale')}</option>
                  <option value="purchase">{t('invoices.form.invoiceTypePurchase')}</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {t('invoices.form.scenario')}
                </label>
                <select
                  {...register('scenario')}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="commercial">{t('invoices.form.scenarioCommercial')}</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card title={t('invoices.form.lineItems')}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Button type="button" variant="secondary" onClick={handleAppend}>
                <Plus size={16} />
                <span>{t('invoices.form.addLineItem')}</span>
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
        </Card>

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
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-6">
        <Card title={t('invoices.form.summary')}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-md bg-slate-50 p-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-600">{t('invoices.form.amountToBeCharged')}</span>
                <span className="text-lg font-semibold text-slate-900">
                  {grandTotal.toFixed(2)} {currency}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <span className="text-xs font-medium text-slate-600">{t('invoices.form.amountToReceive')}</span>
                <span className="text-lg font-semibold text-slate-900">
                  {grandTotal.toFixed(2)} {paymentCurrency}
                </span>
              </div>
            </div>

            {createInvoice.isError && (
              <p className="text-sm text-red-600">{t(getInvoiceErrorKey(createInvoice.error))}</p>
            )}

            <div className="flex gap-2">
              <Button type="button" disabled className="flex-1 gap-2">
                <Send size={16} />
                {t('invoices.form.continueAction')}
              </Button>
              <Button
                type="submit"
                disabled={createInvoice.isPending || !isFormValid}
                className="flex-1"
              >
                {t('invoices.form.save')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </form>
  )
}
