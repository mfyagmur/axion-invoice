import type { InvoiceDisplayStatus, InvoicePdfStatus, InvoiceStatus, PaymentReminderStep } from '@/types/invoice'

export interface InvoiceRow {
  id: string
  invoiceNumber: string
  pdfStatus: InvoicePdfStatus
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
  displayStatus: InvoiceDisplayStatus
  paymentReminderActive: boolean
  reminderSteps: PaymentReminderStep[]
  archived: boolean
}
