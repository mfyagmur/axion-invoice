import { useTranslation } from 'react-i18next'
import { Card } from '@/components/Card'
import type { Customer } from '@/types/customer'

interface CompanyInfoSectionProps {
  customer: Customer
}

export function CompanyInfoSection({ customer }: CompanyInfoSectionProps) {
  const { t } = useTranslation()

  const recipientName = customer.company_name || customer.name
  const recipientFields: { label: string; value: string | null }[] = [
    { label: t('customers.form.address'), value: customer.address },
    { label: t('customers.form.taxOffice'), value: customer.tax_office },
    { label: t('customers.form.taxNumber'), value: customer.tax_number },
    { label: t('customers.form.city'), value: customer.city },
    { label: t('customers.form.postalCode'), value: customer.postal_code },
    { label: t('customers.form.country'), value: customer.country },
    { label: t('customers.form.email'), value: customer.email },
    { label: t('customers.form.phone'), value: customer.phone },
  ]

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

        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {t('invoices.detail.recipientTitle')}
          </span>
          <span className="text-sm font-semibold text-slate-900">{recipientName}</span>
          {recipientFields
            .filter((field) => !!field.value)
            .map((field) => (
              <div key={field.label} className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{field.label}</span>
                <span className="text-sm text-slate-900">{field.value}</span>
              </div>
            ))}
        </div>
      </div>
    </Card>
  )
}
