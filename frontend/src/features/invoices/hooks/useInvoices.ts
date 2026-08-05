import { useQuery } from '@tanstack/react-query'
import { invoicesApi } from '@/features/invoices/api/invoicesApi'

export function useInvoices(customerId?: string) {
  return useQuery({
    queryKey: customerId ? ['invoices', { customerId }] : ['invoices'],
    queryFn: () => invoicesApi.list(customerId ? { customerId } : undefined),
  })
}
