import type { Customer } from '@/types/customer'

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type InvoicePdfStatus = 'pending' | 'ready' | 'failed'

export interface LineItem {
  id: string
  item_code: string | null
  description: string
  quantity: string
  unit_price: string
  discount_rate: string
  discount_amount: string
  tax_rate: string
  tax_amount: string
  other_tax_amount: string
  line_total: string
}

export interface LineItemPayload {
  item_code?: string
  description: string
  quantity: number
  unit_price: number
  discount_rate: number
  tax_rate: number
  other_tax_amount: number
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
  customer_id: string
  currency: string
  field_values: Record<string, string>
  line_items: LineItemPayload[]
  issued_at?: string
  due_at?: string
}
