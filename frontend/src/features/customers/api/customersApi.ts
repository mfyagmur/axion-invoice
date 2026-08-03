import { apiClient } from '@/lib/apiClient'
import type { Customer, CustomerCreatePayload, CustomerUpdatePayload } from '@/types/customer'

export const customersApi = {
  list: () => apiClient.get<Customer[]>('/customers').then((res) => res.data),

  create: (payload: CustomerCreatePayload) =>
    apiClient.post<Customer>('/customers', payload).then((res) => res.data),

  update: (id: string, payload: CustomerUpdatePayload) =>
    apiClient.put<Customer>(`/customers/${id}`, payload).then((res) => res.data),

  remove: (id: string) => apiClient.delete<void>(`/customers/${id}`).then((res) => res.data),
}
