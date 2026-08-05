import { apiClient } from '@/lib/apiClient'
import type { InvoiceCreatePayload, InvoiceDetail, InvoiceSummary } from '@/types/invoice'

export const invoicesApi = {
  list: (params?: { customerId?: string }) =>
    apiClient
      .get<InvoiceSummary[]>('/invoices', {
        params: params?.customerId ? { customer_id: params.customerId } : undefined,
      })
      .then((res) => res.data),

  get: (id: string) => apiClient.get<InvoiceDetail>(`/invoices/${id}`).then((res) => res.data),

  create: (payload: InvoiceCreatePayload) =>
    apiClient.post<InvoiceDetail>('/invoices', payload).then((res) => res.data),

  remove: (id: string) => apiClient.delete<void>(`/invoices/${id}`).then((res) => res.data),

  sendEmail: (id: string) => apiClient.post<void>(`/invoices/${id}/send-email`).then((res) => res.data),

  retryPdf: (id: string) => apiClient.post<InvoiceDetail>(`/invoices/${id}/retry-pdf`).then((res) => res.data),

  downloadPdf: (id: string) =>
    apiClient.get<Blob>(`/invoices/${id}/download`, { responseType: 'blob' }).then((res) => res.data),
}
