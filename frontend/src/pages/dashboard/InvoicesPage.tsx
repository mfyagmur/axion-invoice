import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { ErrorState } from '@/components/ErrorState'
import { useInvoices } from '@/features/invoices/hooks/useInvoices'

const STATUS_KEYS: Record<string, string> = {
  draft: 'invoices.status.draft',
  sent: 'invoices.status.sent',
  paid: 'invoices.status.paid',
  overdue: 'invoices.status.overdue',
  cancelled: 'invoices.status.cancelled',
}

export function InvoicesPage() {
  const { t } = useTranslation()
  const { data: invoices, isLoading, isError, refetch } = useInvoices()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">{t('nav.invoices')}</h1>
        <Link to="/dashboard/invoices/new">
          <Button>
            <Plus size={16} className="mr-1" />
            {t('invoices.list.newInvoice')}
          </Button>
        </Link>
      </div>

      {isLoading && <p className="text-sm text-slate-500">{t('common.loading')}</p>}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (invoices?.length ?? 0) === 0 && (
        <p className="text-sm text-slate-500">{t('invoices.list.empty')}</p>
      )}

      {!isLoading && !isError && (invoices?.length ?? 0) > 0 && (
        <div className="flex flex-col gap-2">
          {invoices?.map((invoice) => (
            <Link
              key={invoice.id}
              to={`/dashboard/invoices/${invoice.id}`}
              className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3 hover:bg-slate-50"
            >
              <div className="flex flex-col">
                <span className="font-medium text-slate-900">{invoice.invoice_number}</span>
                <span className="text-sm text-slate-500">{invoice.customer.name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-500">{t(STATUS_KEYS[invoice.status])}</span>
                <span className="font-medium text-slate-900">
                  {Number(invoice.grand_total).toFixed(2)} {invoice.currency}
                </span>
                <span className="text-slate-400">
                  {invoice.pdf_url ? t('invoices.list.ready') : t('invoices.list.processing')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
