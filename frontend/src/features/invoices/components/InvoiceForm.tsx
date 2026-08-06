import { useEffect, useMemo } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Banknote, FileStack, Plus, Send, User } from 'lucide-react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
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
    unit: string
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
    unit: 'adet',
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

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<InvoiceFormValues>({
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

  function handleAppend() {
    append(emptyLineItem())
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
        unit: item.unit || 'adet',
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
          <Controller
            name="template_id"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={field.onChange}
                options={templates?.map((tpl) => ({ value: tpl.id, label: tpl.name })) || []}
                placeholder={t('invoices.form.selectTemplate')}
                error={errors.template_id ? t('invoices.form.errors.templateRequired') : undefined}
              />
            )}
          />
        </Card>

        <Card icon={<User size={20} />} title={t('invoices.form.invoiceDetails')}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="customer_id"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    label={t('invoices.form.companyName')}
                    value={field.value}
                    onChange={field.onChange}
                    options={customers?.filter((customer) => customer.is_active).map((customer) => ({
                      value: customer.id,
                      label: customer.company_name || customer.name,
                    })) || []}
                    placeholder={t('invoices.form.selectCustomer')}
                    error={errors.customer_id ? t('invoices.form.errors.customerRequired') : undefined}
                  />
                )}
              />

              {selectedCustomer && (
                <Controller
                  name="recipient_contact_ids.0"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      label={t('invoices.form.recipientContact')}
                      value={field.value || ''}
                      onChange={field.onChange}
                      options={selectedCustomer.contacts?.map((contact) => ({
                        value: contact.id,
                        label: `${contact.first_name} ${contact.last_name}`,
                      })) || []}
                      placeholder={t('invoices.form.customerInfoOption')}
                      error={errors.recipient_contact_ids?.[0] ? t('invoices.form.errors.recipientRequired') : undefined}
                    />
                  )}
                />
              )}
            </div>

            {selectedCustomer && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  name="recipient_contact_ids.1"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label={t('invoices.form.additionalContact1')}
                      value={field.value || ''}
                      onChange={field.onChange}
                      options={selectedCustomer.contacts?.map((contact) => ({
                        value: contact.id,
                        label: `${contact.first_name} ${contact.last_name}`,
                      })) || []}
                      placeholder={t('invoices.form.customerInfoOption')}
                    />
                  )}
                />

                <Controller
                  name="recipient_contact_ids.2"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label={t('invoices.form.additionalContact2')}
                      value={field.value || ''}
                      onChange={field.onChange}
                      options={selectedCustomer.contacts?.map((contact) => ({
                        value: contact.id,
                        label: `${contact.first_name} ${contact.last_name}`,
                      })) || []}
                      placeholder={t('invoices.form.customerInfoOption')}
                    />
                  )}
                />
              </div>
            )}
          </div>
        </Card>

        <Card icon={<Banknote size={20} />} title={t('invoices.form.paymentDetails')}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="payment_currency"
                control={control}
                render={({ field }) => (
                  <Select
                    label={t('invoices.form.paymentCurrency')}
                    value={field.value}
                    onChange={field.onChange}
                    options={CURRENCY_OPTIONS.map((code) => ({ value: code, label: code }))}
                  />
                )}
              />
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <Select
                    label={t('invoices.form.invoiceCurrency')}
                    value={field.value}
                    onChange={field.onChange}
                    options={CURRENCY_OPTIONS.map((code) => ({ value: code, label: code }))}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
              <Controller
                name="invoice_type"
                control={control}
                render={({ field }) => (
                  <Select
                    label={t('invoices.form.invoiceType')}
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: 'sale', label: t('invoices.form.invoiceTypeSale') },
                      { value: 'purchase', label: t('invoices.form.invoiceTypePurchase') },
                    ]}
                  />
                )}
              />
              <Controller
                name="scenario"
                control={control}
                render={({ field }) => (
                  <Select
                    label={t('invoices.form.scenario')}
                    value={field.value}
                    onChange={field.onChange}
                    options={[{ value: 'commercial', label: t('invoices.form.scenarioCommercial') }]}
                  />
                )}
              />
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
                currency={currency}
                onRemove={() => remove(index)}
                removeDisabled={lineItemFields.length === 1}
                fieldErrors={errors.line_items?.[index]}
              />
            ))}

            <button
              type="button"
              onClick={handleAppend}
              className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 hover:border-slate-900 hover:text-slate-900 hover:bg-slate-50 active:text-black transition-colors"
            >
              <Plus size={16} />
              <span>{t('invoices.form.addLineItem')}</span>
            </button>
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
