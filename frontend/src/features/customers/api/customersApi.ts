import { apiClient } from '@/lib/apiClient'
import type { Customer, CustomerCreatePayload, CustomerUpdatePayload, CustomerContact, CustomerContactPayload } from '@/types/customer'

export const customersApi = {
  list: () => apiClient.get<Customer[]>('/customers').then((res) => res.data),

  get: (id: string) => apiClient.get<Customer>(`/customers/${id}`).then((res) => res.data),

  create: (payload: CustomerCreatePayload) =>
    apiClient.post<Customer>('/customers', payload).then((res) => res.data),

  update: (id: string, payload: CustomerUpdatePayload) =>
    apiClient.put<Customer>(`/customers/${id}`, payload).then((res) => res.data),

  updateStatus: (id: string, isActive: boolean) =>
    apiClient.patch<Customer>(`/customers/${id}/status`, { is_active: isActive }).then((res) => res.data),

  addContact: (customerId: string, payload: CustomerContactPayload) =>
    apiClient.post<CustomerContact>(`/customers/${customerId}/contacts`, payload).then((res) => res.data),

  updateContact: (customerId: string, contactId: string, payload: CustomerContactPayload) =>
    apiClient.put<CustomerContact>(`/customers/${customerId}/contacts/${contactId}`, payload).then((res) => res.data),

  deleteContact: (customerId: string, contactId: string) =>
    apiClient.delete<void>(`/customers/${customerId}/contacts/${contactId}`).then((res) => res.data),
}
