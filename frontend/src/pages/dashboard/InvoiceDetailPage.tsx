import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useInvoice } from '@/features/invoices/hooks/useInvoice'
import { mapInvoiceToRow } from '@/features/invoices/utils/mapInvoiceToRow'
import { InvoiceActionHeader } from '@/features/invoices/components/InvoiceActionHeader'
import { CompanyInfoSection } from '@/features/invoices/components/CompanyInfoSection'
import { LineItemsTable } from '@/features/invoices/components/LineItemsTable'
import { AdditionalDetailsGrid } from '@/features/invoices/components/AdditionalDetailsGrid'
import { PaymentSummaryBox } from '@/features/invoices/components/PaymentSummaryBox'
import { NetReceivableBox } from '@/features/invoices/components/NetReceivableBox'
import { StatusTimeline } from '@/features/invoices/components/StatusTimeline'
import { PaymentChaserPanel } from '@/features/invoices/components/PaymentChaserPanel'

export function InvoiceDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: invoice, isLoading } = useInvoice(id)
  const [isChaserOpen, setChaserOpen] = useState(false)

  if (isLoading || !invoice) {
    return <p className="text-sm text-slate-500">{t('common.loading')}</p>
  }

  const row = mapInvoiceToRow(invoice)

  return (
    <div className="flex flex-col gap-6">
      <InvoiceActionHeader
        invoice={invoice}
        onBack={() => navigate(-1)}
        onOpenPaymentChaser={() => setChaserOpen(true)}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="flex flex-col gap-6">
          <CompanyInfoSection customer={invoice.customer} />
          <LineItemsTable
            lineItems={invoice.line_items}
            currency={invoice.currency}
            subtotal={invoice.subtotal}
            taxTotal={invoice.tax_total}
            grandTotal={invoice.grand_total}
          />
          <AdditionalDetailsGrid notes={invoice.notes} />
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-6">
          <PaymentSummaryBox
            grandTotal={invoice.grand_total}
            subtotal={invoice.subtotal}
            taxTotal={invoice.tax_total}
            currency={invoice.currency}
          />
          <NetReceivableBox row={row} />
          <StatusTimeline status={invoice.status} createdAt={invoice.created_at} />
        </div>
      </div>

      <PaymentChaserPanel row={row} isOpen={isChaserOpen} onClose={() => setChaserOpen(false)} />
    </div>
  )
}
