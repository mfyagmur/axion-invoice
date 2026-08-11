import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { invoicesApi } from '@/features/invoices/api/invoicesApi'

export function useRestoreInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => invoicesApi.restore(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Fatura taslak durumuna alındı')
    },
    onError: () => {
      toast.error('Fatura geri alınamadı')
    },
  })
}
