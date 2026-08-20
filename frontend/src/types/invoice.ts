import type { Customer } from '@/types/customer'
import type { DefinitionBankAccount } from '@/types/definitions'

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type InvoicePdfStatus = 'pending' | 'ready' | 'failed'
export type InvoiceType = 'sale' | 'purchase'
export type InvoiceScenario = 'commercial'
export type CommissionPayer = 'self' | 'customer'

export interface LineItem {
  id: string
  item_code: string | null
  description: string
  quantity: string
  unit_price: string
  unit: string
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
  unit?: string
  discount_rate: number
  tax_rate: number
  other_tax_amount: number
}

export interface InvoiceSummary {
  id: string
  invoice_number: string
  status: InvoiceStatus
  currency: string
  payment_currency: string
  exchange_rate: string | null
  local_amount: string | null
  invoice_type: InvoiceType
  scenario: InvoiceScenario
  commission_payer: CommissionPayer
  grand_total: string
  pdf_url: string | null
  pdf_status: InvoicePdfStatus
  payment_reminder_active: boolean
  archived: boolean
  issued_at: string | null
  created_at: string
  customer: Customer
}

export interface CustomerSnapshot {
  name: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  country: string | null
  tax_office: string | null
  tax_number: string | null
  email: string | null
  phone: string | null
}

export interface InvoiceDetail extends InvoiceSummary {
  template_id: string
  data_json: Record<string, string>
  subtotal: string
  tax_total: string
  pdf_error: string | null
  notes: string | null
  due_at: string | null
  bank_account_id: string | null
  bank_account: DefinitionBankAccount | null
  bank_account_id_2: string | null
  bank_account_2: DefinitionBankAccount | null
  bank_account_id_3: string | null
  bank_account_3: DefinitionBankAccount | null
  recipient_contact_ids: string[]
  line_items: LineItem[]
  customer_snapshot: CustomerSnapshot | null
}

export interface InvoiceCreatePayload {
  template_id: string
  customer_id: string
  bank_account_id?: string
  bank_account_id_2?: string
  bank_account_id_3?: string
  currency: string
  payment_currency: string
  exchange_rate?: string
  invoice_type: InvoiceType
  scenario: InvoiceScenario
  commission_payer: CommissionPayer
  recipient_contact_ids: string[]
  field_values: Record<string, string>
  line_items: LineItemPayload[]
  notes?: string
  issued_at?: string
  due_at?: string
}

export interface InvoiceUpdatePayload {
  customer_snapshot?: Partial<CustomerSnapshot>
  notes?: string | null
  line_items?: LineItemPayload[]
  bank_account_id?: string | null
  bank_account_id_2?: string | null
  bank_account_id_3?: string | null
}
