import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/Button'
import { InvoiceStatusBadge } from '@/features/invoices/components/InvoiceStatusBadge'
import { InvoiceRowActions } from '@/features/invoices/components/InvoiceRowActions'
import { mapInvoiceToRow } from '@/features/invoices/utils/mapInvoiceToRow'
import { formatDateDisplay } from '@/features/invoices/utils/dateHelpers'
import { useDownloadInvoicePdf } from '@/features/invoices/hooks/useDownloadInvoicePdf'
import type { InvoiceDetail } from '@/types/invoice'

interface InvoiceActionHeaderProps {
  invoice: InvoiceDetail
  onBack: () => void
  onOpenPaymentChaser: () => void
}

export function InvoiceActionHeader({ invoice, onBack, onOpenPaymentChaser }: InvoiceActionHeaderProps) {
  const { t } = useTranslation()
  const downloadPdf = useDownloadInvoicePdf()
  const row = mapInvoiceToRow(invoice)
  const isPdfReady = invoice.pdf_status === 'ready' && !!invoice.pdf_url
  const isCancelled = invoice.status === 'cancelled'

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
          aria-label={t('common.back')}
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900">{invoice.invoice_number}</h1>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <span className="text-sm text-slate-500">{formatDateDisplay(new Date(invoice.created_at))}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onOpenPaymentChaser}
          disabled={isCancelled}
        >
          {t('invoices.actions.paymentReminder')}
        </Button>
        <Button
          type="button"
          onClick={() => downloadPdf.mutate({ id: invoice.id, filename: invoice.invoice_number })}
          disabled={!isPdfReady || downloadPdf.isPending}
        >
          {t('invoices.detail.download')}
        </Button>
        <InvoiceRowActions row={row} />
      </div>
    </div>
  )
}
