import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Tabs } from '@/components/Tabs'
import { useCustomer } from '@/features/customers/hooks/useCustomer'
import { useInvoices } from '@/features/invoices/hooks/useInvoices'

const STATUS_KEYS: Record<string, string> = {
  draft: 'invoices.status.draft',
  sent: 'invoices.status.sent',
  paid: 'invoices.status.paid',
  overdue: 'invoices.status.overdue',
  cancelled: 'invoices.status.cancelled',
}

export function CustomerDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: customer, isLoading } = useCustomer(id)
  const { data: invoices, isLoading: isInvoicesLoading } = useInvoices(id)
  const [activeTab, setActiveTab] = useState<'invoices' | 'contact'>('invoices')

  if (isLoading || !customer) {
    return <p className="text-sm text-slate-500">{t('common.loading')}</p>
  }

  const displayName = customer.company_name || customer.name

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
          aria-label={t('customers.detail.back')}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-semibold text-slate-900">{t('customers.detail.title')}</h1>
      </div>

      <div className="rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">{displayName}</h2>

        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div className="flex flex-col gap-4">
            <Field label={t('customers.form.country')} value={customer.country} />
            <Field label={t('customers.form.city')} value={customer.city} />
            <Field label={t('customers.form.postalCode')} value={customer.postal_code} />
            <Field label={t('customers.form.phone')} value={customer.phone} />
            <Field label={t('customers.form.address')} value={customer.address} />
          </div>
          <div className="flex flex-col gap-4">
            <Field label={t('customers.detail.taxIdLabel')} value={customer.tax_number} />
            <Field label={t('customers.form.taxOffice')} value={customer.tax_office} />
            <Field label={t('customers.form.mersisNo')} value={customer.mersis_no} />
            <Field label={t('customers.form.website')} value={customer.website} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Tabs
          items={[
            { key: 'invoices', label: t('customers.detail.tabs.invoices') },
            { key: 'contact', label: t('customers.detail.tabs.contact') },
          ]}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'invoices' | 'contact')}
        />

        {activeTab === 'invoices' && (
          <div className="flex flex-col gap-2">
            {isInvoicesLoading && <p className="text-sm text-slate-500">{t('common.loading')}</p>}
            {!isInvoicesLoading && (invoices?.length ?? 0) === 0 && (
              <p className="text-sm text-slate-500">{t('customers.detail.invoicesTab.empty')}</p>
            )}
            {invoices?.map((invoice) => (
              <Link
                key={invoice.id}
                to={`/dashboard/invoices/${invoice.id}`}
                className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3 hover:bg-slate-50"
              >
                <span className="font-medium text-slate-900">{invoice.invoice_number}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-500">{t(STATUS_KEYS[invoice.status])}</span>
                  <span className="font-medium text-slate-900">
                    {Number(invoice.grand_total).toFixed(2)} {invoice.currency}
                  </span>
                  <span className="text-slate-400">
                    {invoice.issued_at ? new Date(invoice.issued_at).toLocaleDateString() : '—'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="rounded-xl border border-slate-200 p-6 text-sm">
            <Field label={t('customers.detail.contact.name')} value={customer.name} />
            <div className="mt-4">
              <Field label={t('customers.detail.contact.email')} value={customer.email} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-slate-900">{value || '—'}</span>
    </div>
  )
}
