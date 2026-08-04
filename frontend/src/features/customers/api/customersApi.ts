import { apiClient } from '@/lib/apiClient'
import type { Customer, CustomerCreatePayload, CustomerUpdatePayload } from '@/types/customer'

export const customersApi = {
  list: () => apiClient.get<Customer[]>('/customers').then((res) => res.data),

  create: (payload: CustomerCreatePayload) =>
    apiClient.post<Customer>('/customers', payload).then((res) => res.data),

  update: (id: string, payload: CustomerUpdatePayload) =>
    apiClient.put<Customer>(`/customers/${id}`, payload).then((res) => res.data),

  updateStatus: (id: string, isActive: boolean) =>
    apiClient.patch<Customer>(`/customers/${id}/status`, { is_active: isActive }).then((res) => res.data),
}
