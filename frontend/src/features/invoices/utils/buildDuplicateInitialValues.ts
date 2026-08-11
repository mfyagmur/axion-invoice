import type { InvoiceFormValues } from '@/features/invoices/components/InvoiceForm'
import type { InvoiceDetail } from '@/types/invoice'

export function buildDuplicateInitialValues(invoice: InvoiceDetail): InvoiceFormValues {
  return {
    template_id: invoice.template_id,
    customer_id: invoice.customer.id,
    currency: invoice.currency,
    payment_currency: invoice.payment_currency,
    exchange_rate: invoice.exchange_rate ?? '',
    invoice_type: invoice.invoice_type,
    scenario: invoice.scenario,
    commission_payer: invoice.commission_payer,
    recipient_contact_ids: invoice.recipient_contact_ids,
    field_values: invoice.data_json,
    line_items: invoice.line_items.map((item) => ({
      item_code: item.item_code ?? '',
      description: item.description,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      unit: item.unit,
      discount_rate: Number(item.discount_rate),
      tax_rate: Number(item.tax_rate),
      other_tax_amount: Number(item.other_tax_amount),
    })),
    notes: invoice.notes ?? '',
    issued_at: new Date().toISOString().slice(0, 10),
    due_at: '',
  }
}
