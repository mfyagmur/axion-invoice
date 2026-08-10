import type { InvoiceStatus } from '@/types/invoice'

export interface InvoiceRow {
  id: string
  invoiceNumber: string
  customerName: string
  customerEmail: string | null
  amount: string
  currency: string
  secondaryAmount?: string
  createdAt: string
  status: InvoiceStatus
}
