import { useQuery } from '@tanstack/react-query'
import { invoicesApi } from '@/features/invoices/api/invoicesApi'

export function useInvoices() {
  return useQuery({ queryKey: ['invoices'], queryFn: invoicesApi.list })
}
