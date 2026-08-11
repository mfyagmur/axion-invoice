import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { invoicesApi } from '@/features/invoices/api/invoicesApi'

export function useArchiveInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => invoicesApi.archive(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Fatura arşivlendi')
    },
    onError: () => {
      toast.error('Fatura arşivlenemedi')
    },
  })
}
