import type { Customer, InvoiceCustomerPayload } from '@/types/customer'

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type InvoicePdfStatus = 'pending' | 'ready' | 'failed'

export interface LineItem {
  id: string
  description: string
  quantity: string
  unit_price: string
  line_total: string
}

export interface LineItemPayload {
  description: string
  quantity: number
  unit_price: number
}

export interface InvoiceSummary {
  id: string
  invoice_number: string
  status: InvoiceStatus
  currency: string
  grand_total: string
  pdf_url: string | null
  pdf_status: InvoicePdfStatus
  issued_at: string | null
  created_at: string
  customer: Customer
}

export interface InvoiceDetail extends InvoiceSummary {
  template_id: string
  data_json: Record<string, string>
  subtotal: string
  tax_total: string
  pdf_error: string | null
  due_at: string | null
  line_items: LineItem[]
}

export interface InvoiceCreatePayload {
  template_id: string
  customer_id?: string
  customer?: InvoiceCustomerPayload
  currency: string
  tax_total: number
  field_values: Record<string, string>
  line_items: LineItemPayload[]
  issued_at?: string
  due_at?: string
}
