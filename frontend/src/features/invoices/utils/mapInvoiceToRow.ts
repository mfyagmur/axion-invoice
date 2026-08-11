import type { InvoiceSummary } from '@/types/invoice'
import type { InvoiceRow } from '@/features/invoices/types/invoiceRow'

export function mapInvoiceToRow(invoice: InvoiceSummary): InvoiceRow {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
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
    createdAt: invoice.created_at,
    createdAtRaw: invoice.created_at,
    status: invoice.status,
  }
}
