import { useState } from 'react'
import { Building2, Mail, MapPin, Phone, Receipt } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { EditIconButton } from '@/features/invoices/components/EditIconButton'
import { useUpdateInvoice } from '@/features/invoices/hooks/useUpdateInvoice'
import type { Customer } from '@/types/customer'
import type { CustomerSnapshot, InvoiceStatus } from '@/types/invoice'

interface CompanyInfoSectionProps {
  customer: Customer
  invoiceId: string
  status: InvoiceStatus
  customerSnapshot: CustomerSnapshot | null
}

interface FormState {
  name: string
  address: string
  city: string
  postal_code: string
  country: string
  tax_office: string
  tax_number: string
  email: string
  phone: string
}

export function CompanyInfoSection({ customer, invoiceId, status, customerSnapshot }: CompanyInfoSectionProps) {
  const { t } = useTranslation()
  const updateInvoice = useUpdateInvoice()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<FormState | null>(null)

  const recipientName = customerSnapshot?.name || customer.company_name || customer.name
  const address = customerSnapshot?.address ?? customer.address
  const city = customerSnapshot?.city ?? customer.city
  const postalCode = customerSnapshot?.postal_code ?? customer.postal_code
  const country = customerSnapshot?.country ?? customer.country
  const taxOffice = customerSnapshot?.tax_office ?? customer.tax_office
  const taxNumber = customerSnapshot?.tax_number ?? customer.tax_number
  const email = customerSnapshot?.email ?? customer.email
  const phone = customerSnapshot?.phone ?? customer.phone

  const locationLine = [city, postalCode, country].filter(Boolean).join(' / ')

  const canEdit = status === 'draft'

  const startEditing = () => {
    setForm({
      name: recipientName ?? '',
      address: address ?? '',
      city: city ?? '',
      postal_code: postalCode ?? '',
      country: country ?? '',
      tax_office: taxOffice ?? '',
      tax_number: taxNumber ?? '',
      email: email ?? '',
      phone: phone ?? '',
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!form) return
    updateInvoice.mutate(
      { id: invoiceId, payload: { customer_snapshot: form } },
      { onSuccess: () => setIsEditing(false) },
    )
  }

  const action = !canEdit ? null : isEditing ? (
    <div className="flex items-center gap-2">
      <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} disabled={updateInvoice.isPending}>
        {t('common.cancel')}
      </Button>
      <Button type="button" onClick={handleSave} disabled={updateInvoice.isPending}>
        {t('common.save')}
      </Button>
    </div>
  ) : (
    <EditIconButton onClick={startEditing} />
  )

  return (
    <Card title={t('invoices.detail.companyInfoTitle')} action={action}>
      {isEditing && form ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={t('invoices.detail.recipientNameLabel')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label={t('customers.form.email')}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label={t('customers.form.phone')}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            label={t('customers.form.address')}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <Input
            label={t('customers.form.city')}
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <Input
            label={t('customers.form.postalCode')}
            value={form.postal_code}
            onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
          />
          <Input
            label={t('customers.form.country')}
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
          <Input
            label={t('customers.form.taxOffice')}
            value={form.tax_office}
            onChange={(e) => setForm({ ...form, tax_office: e.target.value })}
          />
          <Input
            label={t('customers.form.taxNumber')}
            value={form.tax_number}
            onChange={(e) => setForm({ ...form, tax_number: e.target.value })}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {t('invoices.detail.senderTitle')}
            </span>
            {/* TODO: gerçek gönderen şirket profili eklenince güncellenecek */}
            <span className="text-sm font-semibold text-slate-900">{t('invoices.detail.senderPlaceholderName')}</span>
            <span className="text-xs text-slate-400">{t('invoices.detail.senderPlaceholderNote')}</span>
          </div>

          <div className="rounded-xl border border-slate-300 p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
                <Building2 size={18} className="mt-0.5 shrink-0 text-blue-900" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t('invoices.detail.recipientTitle')}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{recipientName}</span>
                </div>
              </div>

              {(address || locationLine) && (
                <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-blue-900" />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t('invoices.detail.recipientAddressLabel')}
                    </span>
                    {address && <span className="text-sm font-bold text-slate-900">{address}</span>}
                    {locationLine && <span className="text-sm text-slate-700">{locationLine}</span>}
                  </div>
                </div>
              )}

              {(taxOffice || taxNumber) && (
                <div className="flex items-start gap-3">
                  <Receipt size={18} className="mt-0.5 shrink-0 text-blue-900" />
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t('invoices.detail.recipientTaxLabel')}
                    </span>
                    {taxOffice && (
                      <span className="text-sm text-slate-500">
                        {t('customers.form.taxOffice')}: <span className="font-bold text-slate-900">{taxOffice}</span>
                      </span>
                    )}
                    {taxNumber && (
                      <span className="text-sm text-slate-500">
                        {t('customers.form.taxNumber')}: <span className="font-bold text-slate-900">{taxNumber}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {(email || phone) && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex shrink-0 items-center gap-0.5 text-blue-900">
                    <Mail size={16} />
                    <Phone size={16} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t('invoices.detail.recipientContactLabel')}
                    </span>
                    {email && (
                      <span className="text-sm text-slate-500">
                        {t('customers.form.email')}: <span className="font-bold text-slate-900">{email}</span>
                      </span>
                    )}
                    {phone && (
                      <span className="text-sm text-slate-500">
                        {t('customers.form.phone')}: <span className="font-bold text-slate-900">{phone}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
