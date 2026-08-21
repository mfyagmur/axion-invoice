import { useTranslation } from 'react-i18next'
import { ArrowLeft, Eye, RefreshCw } from 'lucide-react'
import { Button } from '@/components/Button'
import { InfoTooltip } from '@/components/InfoTooltip'
import { InvoiceStatusBadge } from '@/features/invoices/components/InvoiceStatusBadge'
import { InvoiceRowActions } from '@/features/invoices/components/InvoiceRowActions'
import { useDateFormat } from '@/hooks/useDateFormat'
import { useDownloadInvoicePdf } from '@/features/invoices/hooks/useDownloadInvoicePdf'
import { useRetryInvoicePdf } from '@/features/invoices/hooks/useRetryInvoicePdf'
import type { InvoiceDetail } from '@/types/invoice'
import type { InvoiceRow } from '@/features/invoices/types/invoiceRow'

interface InvoiceActionHeaderProps {
  invoice: InvoiceDetail
  row: InvoiceRow
  onBack: () => void
  onOpenPaymentChaser: () => void
  onOpenPreview: () => void
}

export function InvoiceActionHeader({
  invoice,
  row,
  onBack,
  onOpenPaymentChaser,
  onOpenPreview,
}: InvoiceActionHeaderProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
  const downloadPdf = useDownloadInvoicePdf()
  const retryPdf = useRetryInvoicePdf()
  const isPdfReady = invoice.pdf_status === 'ready' && !!invoice.pdf_url
  const isPdfRegenerating = invoice.pdf_status === 'pending' || retryPdf.isPending
  const isCancelled = invoice.status === 'cancelled'

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="flex flex-col gap-1 text-sm text-slate-500">
            <span>{formatDate(invoice.created_at)}</span>
            {invoice.due_at && (
              <span className="font-medium text-slate-700">
                {t('invoices.detail.dueDate')}: {formatDate(invoice.due_at)}
              </span>
            )}
            {invoice.pdf_status === 'failed' && (
              <span className="font-medium text-red-600">{t('invoices.detail.pdfFailed')}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onOpenPaymentChaser}
          disabled={isCancelled}
        >
          {t('invoices.actions.paymentReminder')}
        </Button>
        <Button type="button" variant="secondary" className="gap-2" onClick={onOpenPreview}>
          <Eye size={16} />
          {t('invoices.detail.preview')}
        </Button>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="secondary"
            className="gap-2"
            onClick={() => retryPdf.mutate(invoice.id)}
            disabled={isPdfRegenerating}
            title={invoice.pdf_status === 'failed' ? t('invoices.detail.retryPdf') : t('invoices.detail.regeneratePdf')}
          >
            <RefreshCw size={16} className={isPdfRegenerating ? 'animate-spin' : undefined} />
            {isPdfRegenerating
              ? t('invoices.detail.pdfRegenerating')
              : invoice.pdf_status === 'failed'
                ? t('invoices.detail.retryPdf')
                : t('invoices.detail.regeneratePdf')}
          </Button>
          <InfoTooltip title={t('invoices.detail.regeneratePdf')} description={t('invoices.detail.regeneratePdfHint')} />
        </div>
        <Button
          type="button"
          onClick={() => downloadPdf.mutate({ id: invoice.id, filename: invoice.invoice_number })}
          disabled={!isPdfReady || downloadPdf.isPending}
        >
          {t('invoices.detail.download')}
        </Button>
        <InvoiceRowActions row={row} disableView />
      </div>
    </div>
  )
}
