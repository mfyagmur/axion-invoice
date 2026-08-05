import { useQuery } from '@tanstack/react-query'
import { invoicesApi } from '@/features/invoices/api/invoicesApi'

export function useInvoicePreview(id: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['invoice-preview', id],
    queryFn: () => invoicesApi.preview(id as string),
    enabled: !!id && enabled,
  })
}
