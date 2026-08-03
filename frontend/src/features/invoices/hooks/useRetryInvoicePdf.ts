import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invoicesApi } from '@/features/invoices/api/invoicesApi'

export function useRetryInvoicePdf() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => invoicesApi.retryPdf(id),
    onSuccess: (invoice) => {
      queryClient.setQueryData(['invoices', invoice.id], invoice)
    },
  })
}
