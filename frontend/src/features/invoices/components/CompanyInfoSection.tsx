import { Building2, Mail, MapPin, Phone, Receipt } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/Card'
import type { Customer } from '@/types/customer'

interface CompanyInfoSectionProps {
  customer: Customer
}

export function CompanyInfoSection({ customer }: CompanyInfoSectionProps) {
  const { t } = useTranslation()

  const recipientName = customer.company_name || customer.name
  const locationLine = [customer.city, customer.postal_code, customer.country]
    .filter(Boolean)
    .join(' / ')

  return (
    <Card title={t('invoices.detail.companyInfoTitle')}>
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

            {(customer.address || locationLine) && (
              <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
                <MapPin size={18} className="mt-0.5 shrink-0 text-blue-900" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t('invoices.detail.recipientAddressLabel')}
                  </span>
                  {customer.address && (
                    <span className="text-sm font-bold text-slate-900">{customer.address}</span>
                  )}
                  {locationLine && <span className="text-sm text-slate-700">{locationLine}</span>}
                </div>
              </div>
            )}

            {(customer.tax_office || customer.tax_number) && (
              <div className="flex items-start gap-3">
                <Receipt size={18} className="mt-0.5 shrink-0 text-blue-900" />
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t('invoices.detail.recipientTaxLabel')}
                  </span>
                  {customer.tax_office && (
                    <span className="text-sm text-slate-500">
                      {t('customers.form.taxOffice')}:{' '}
                      <span className="font-bold text-slate-900">{customer.tax_office}</span>
                    </span>
                  )}
                  {customer.tax_number && (
                    <span className="text-sm text-slate-500">
                      {t('customers.form.taxNumber')}:{' '}
                      <span className="font-bold text-slate-900">{customer.tax_number}</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {(customer.email || customer.phone) && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex shrink-0 items-center gap-0.5 text-blue-900">
                  <Mail size={16} />
                  <Phone size={16} />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t('invoices.detail.recipientContactLabel')}
                  </span>
                  {customer.email && (
                    <span className="text-sm text-slate-500">
                      {t('customers.form.email')}:{' '}
                      <span className="font-bold text-slate-900">{customer.email}</span>
                    </span>
                  )}
                  {customer.phone && (
                    <span className="text-sm text-slate-500">
                      {t('customers.form.phone')}:{' '}
                      <span className="font-bold text-slate-900">{customer.phone}</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
