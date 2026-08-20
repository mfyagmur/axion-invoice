import type { InvoiceSummary } from '@/types/invoice'
import type { InvoiceRow } from '@/features/invoices/types/invoiceRow'

export function mapInvoiceToRow(invoice: InvoiceSummary): InvoiceRow {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    pdfStatus: invoice.pdf_status,
    customerName: [invoice.customer.first_name, invoice.customer.last_name].filter(Boolean).join(' ') || invoice.customer.name,
    customerCompanyName: invoice.customer.company_name || invoice.customer.name,
    customerEmail: invoice.customer.email ?? null,
    amount: Number(invoice.grand_total).toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    currency: invoice.currency,
    secondaryAmount: invoice.local_amount
      ? `${Number(invoice.local_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TRY`
      : undefined,
    paymentCurrency: invoice.payment_currency,
    exchangeRate: invoice.exchange_rate,
    createdAt: invoice.created_at,
    createdAtRaw: invoice.created_at,
    status: invoice.status,
    paymentReminderActive: invoice.payment_reminder_active,
    archived: invoice.archived,
  }
}
