import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, FileText, Plus } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Modal } from '@/components/Modal'
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

const contactSchema = z.object({
  first_name: z.string().min(1, 'customers.form.errors.firstNameRequired'),
  last_name: z.string().min(1, 'customers.form.errors.lastNameRequired'),
  email: z.string().email('customers.form.errors.emailInvalid'),
  phone: z.string().min(1, 'customers.form.errors.phoneRequired'),
})

type ContactFormValues = z.infer<typeof contactSchema>

export function CustomerDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: customer, isLoading } = useCustomer(id)
  const { data: invoices, isLoading: isInvoicesLoading } = useInvoices(id)
  const [activeTab, setActiveTab] = useState<'invoices' | 'contact'>('invoices')
  const [contacts, setContacts] = useState<ContactFormValues[]>([])
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
    },
  })

  const onAddContact = handleSubmit((data) => {
    setContacts([...contacts, data])
    reset()
    setIsContactModalOpen(false)
  })

  if (isLoading || !customer) {
    return <p className="text-sm text-slate-500">{t('common.loading')}</p>
  }

  const displayName = customer.company_name || customer.name

  return (
    <div className="flex flex-col gap-4">
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
          <div className="flex flex-col gap-3">
            <Field label={t('customers.form.country')} value={customer.country} />
            <Field label={t('customers.form.city')} value={customer.city} />
            <Field label={t('customers.form.postalCode')} value={customer.postal_code} />
            <Field label={t('customers.form.phone')} value={customer.phone} />
            <Field label={t('customers.form.address')} value={customer.address} />
          </div>
          <div className="flex flex-col gap-3">
            <Field label={t('customers.detail.taxIdLabel')} value={customer.tax_number} />
            <Field label={t('customers.form.taxOffice')} value={customer.tax_office} />
            <Field label={t('customers.form.mersisNo')} value={customer.mersis_no} />
            <Field label={t('customers.form.website')} value={customer.website} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
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
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <FileText size={48} className="text-slate-300" />
                <p className="text-sm text-slate-500">{t('customers.detail.invoicesTab.empty')}</p>
              </div>
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
            <div className="flex items-start gap-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <span className="text-sm font-semibold text-slate-600">
                  {((customer.first_name?.[0] || '') + (customer.last_name?.[0] || '')).toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-8">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t('customers.detail.contact.name')}
                  </span>
                  <span className="text-slate-900">{customer.name || '—'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t('customers.detail.contact.email')}
                  </span>
                  <span className="text-slate-900">{customer.email || '—'}</span>
                </div>
              </div>
            </div>

            {contacts.length > 0 && (
              <div className="mt-6 border-t border-slate-200 pt-6">
                <h3 className="mb-4 text-sm font-medium text-slate-900">
                  {t('customers.detail.contact.additionalContacts')}
                </h3>
                {contacts.map((contact, idx) => (
                  <div key={idx} className="mb-4 flex items-start gap-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                      <span className="text-sm font-semibold text-slate-600">
                        {((contact.first_name?.[0] || '') + (contact.last_name?.[0] || '')).toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          {t('customers.detail.contact.name')}
                        </span>
                        <span className="text-slate-900">
                          {contact.first_name} {contact.last_name}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          {t('customers.detail.contact.email')}
                        </span>
                        <span className="text-slate-900">{contact.email}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          {t('customers.form.phone')}
                        </span>
                        <span className="text-slate-900">{contact.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsContactModalOpen(true)}
              >
                <Plus size={16} className="mr-2" />
                {t('customers.detail.contact.addButton')}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title={t('customers.detail.contact.addContactTitle')}
      >
        <form onSubmit={onAddContact} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('customers.form.firstName')}
              error={errors.first_name && t(errors.first_name.message ?? '')}
              {...register('first_name')}
            />
            <Input
              label={t('customers.form.lastName')}
              error={errors.last_name && t(errors.last_name.message ?? '')}
              {...register('last_name')}
            />
          </div>

          <Input
            label={t('customers.form.email')}
            type="email"
            error={errors.email && t(errors.email.message ?? '')}
            {...register('email')}
          />

          <Input
            label={t('customers.form.phone')}
            error={errors.phone && t(errors.phone.message ?? '')}
            {...register('phone')}
          />

          <div className="flex gap-2 pt-4">
            <Button type="submit">{t('customers.detail.contact.addContactSubmit')}</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                reset()
                setIsContactModalOpen(false)
              }}
            >
              {t('customers.form.cancel')}
            </Button>
          </div>
        </form>
      </Modal>
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
