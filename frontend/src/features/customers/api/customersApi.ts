import { apiClient } from '@/lib/apiClient'
import type { Customer, CustomerCreatePayload } from '@/types/customer'

export const customersApi = {
  list: () => apiClient.get<Customer[]>('/customers').then((res) => res.data),

  create: (payload: CustomerCreatePayload) =>
    apiClient.post<Customer>('/customers', payload).then((res) => res.data),

  remove: (id: string) => apiClient.delete<void>(`/customers/${id}`).then((res) => res.data),
}
