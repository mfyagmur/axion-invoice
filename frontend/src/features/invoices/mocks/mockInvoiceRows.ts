import type { InvoiceRow } from '@/features/invoices/types/invoiceRow'

export const MOCK_INVOICE_ROWS: InvoiceRow[] = [
  {
    id: 'mock-1',
    invoiceNumber: '#78143759',
    customerName: 'Rainsoft Contact',
    customerCompanyName: 'Rainsoft',
    customerEmail: 'billing@rainsoft.com',
    amount: '1,200.00',
    currency: 'USD',
    secondaryAmount: 'Net 44,644.83 TRY',
    createdAt: '2026-08-10T00:00:00Z',
    status: 'draft',
  },
  {
    id: 'mock-2',
    invoiceNumber: '#78143760',
    customerName: 'John Smith',
    customerCompanyName: 'Acme Corp',
    customerEmail: 'ap@acmecorp.com',
    amount: '3,450.00',
    currency: 'EUR',
    secondaryAmount: 'Net 128,910.20 TRY',
    createdAt: '2026-08-09T00:00:00Z',
    status: 'sent',
  },
  {
    id: 'mock-3',
    invoiceNumber: '#78143761',
    customerName: 'Alice Johnson',
    customerCompanyName: 'TechStart Ltd',
    customerEmail: 'finance@techstart.com',
    amount: '5,000.00',
    currency: 'GBP',
    createdAt: '2026-08-08T00:00:00Z',
    status: 'paid',
  },
]
