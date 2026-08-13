import type { InvoiceStatus } from '@/types/invoice'

export interface InvoiceRow {
  id: string
  invoiceNumber: string
  customerName: string
  customerCompanyName: string
  customerEmail: string | null
  amount: string
  currency: string
  secondaryAmount?: string
  paymentCurrency?: string
  exchangeRate?: string | null
  createdAt: string
  createdAtRaw: string
  status: InvoiceStatus
  paymentReminderActive: boolean
  archived: boolean
}
