import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { invoicesApi } from '@/features/invoices/api/invoicesApi'
import type { InvoiceUpdatePayload } from '@/types/invoice'

export function useUpdateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: InvoiceUpdatePayload }) =>
      invoicesApi.update(id, payload),
    onSuccess: (invoice) => {
      queryClient.setQueryData(['invoices', invoice.id], invoice)
      void queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Değişiklikler kaydedildi')
    },
    onError: () => {
      toast.error('Kaydedilemedi, lütfen tekrar deneyin')
    },
  })
}
