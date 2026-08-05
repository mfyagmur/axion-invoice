import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/Button'
import { useDownloadInvoicePdf } from '@/features/invoices/hooks/useDownloadInvoicePdf'
import { useInvoice } from '@/features/invoices/hooks/useInvoice'
import { useInvoicePreview } from '@/features/invoices/hooks/useInvoicePreview'
import { useRetryInvoicePdf } from '@/features/invoices/hooks/useRetryInvoicePdf'
import { useSendInvoiceEmail } from '@/features/invoices/hooks/useSendInvoiceEmail'

export function InvoiceDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { data: invoice, isLoading } = useInvoice(id)
  const downloadPdf = useDownloadInvoicePdf()
  const sendEmail = useSendInvoiceEmail()
  const retryPdf = useRetryInvoicePdf()
  const [showPreview, setShowPreview] = useState(false)
  const { data: previewHtml, isLoading: isPreviewLoading } = useInvoicePreview(id, showPreview)

  if (isLoading || !invoice) {
    return <p className="text-sm text-slate-500">{t('common.loading')}</p>
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{invoice.invoice_number}</h1>
        <p className="text-sm text-slate-500">{invoice.customer.name}</p>
      </div>

      <div className="flex flex-col gap-1 rounded-md bg-slate-50 p-4 text-sm">
        <div className="flex justify-between">
          <span>{t('invoices.form.subtotal')}</span>
          <span>
            {Number(invoice.subtotal).toFixed(2)} {invoice.currency}
          </span>
        </div>
        <div className="flex justify-between">
          <span>{t('invoices.form.tax')}</span>
          <span>
            {Number(invoice.tax_total).toFixed(2)} {invoice.currency}
          </span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>{t('invoices.form.grandTotal')}</span>
          <span>
            {Number(invoice.grand_total).toFixed(2)} {invoice.currency}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-900">{t('invoices.form.lineItems')}</h2>
        {invoice.line_items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm text-slate-600">
            <span>
              {item.description} × {Number(item.quantity)}
            </span>
            <span>{Number(item.line_total).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-3">
          {invoice.pdf_status === 'ready' && invoice.pdf_url ? (
            <Button
              onClick={() => downloadPdf.mutate({ id: invoice.id, filename: invoice.invoice_number })}
              disabled={downloadPdf.isPending}
            >
              {t('invoices.detail.download')}
            </Button>
          ) : invoice.pdf_status === 'failed' ? (
            <Button
              variant="secondary"
              onClick={() => retryPdf.mutate(invoice.id)}
              disabled={retryPdf.isPending}
            >
              {t('invoices.detail.retryPdf')}
            </Button>
          ) : (
            <p className="text-sm text-slate-500">{t('invoices.list.processing')}</p>
          )}
        </div>
        {invoice.pdf_status === 'failed' && (
          <p className="text-sm text-red-600">{t('invoices.detail.pdfFailed')}</p>
        )}
      </div>
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={() => sendEmail.mutate(invoice.id)}
          disabled={sendEmail.isPending || !invoice.customer.email}
        >
          {t('invoices.detail.sendEmail')}
        </Button>
        <Button variant="secondary" onClick={() => setShowPreview((open) => !open)}>
          {showPreview ? t('invoices.detail.hidePreview') : t('invoices.detail.preview')}
        </Button>
      </div>
      {sendEmail.isSuccess && <p className="text-sm text-green-600">{t('invoices.detail.emailSent')}</p>}

      {showPreview && (
        <div className="max-w-3xl">
          {isPreviewLoading && <p className="text-sm text-slate-500">{t('common.loading')}</p>}
          {previewHtml && (
            <iframe
              title="invoice-preview"
              srcDoc={previewHtml}
              className="h-200 w-full rounded-md border border-slate-200"
            />
          )}
        </div>
      )}
    </div>
  )
}
