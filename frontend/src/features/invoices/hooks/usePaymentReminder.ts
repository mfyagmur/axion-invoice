import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { invoicesApi } from '@/features/invoices/api/invoicesApi'

export function usePaymentReminder() {
  const queryClient = useQueryClient()

  const activateMutation = useMutation({
    mutationFn: (id: string) => invoicesApi.activatePaymentReminder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: () => {
      toast.error('Ödeme hatırlatıcısı aktif edilemedi')
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => invoicesApi.deactivatePaymentReminder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: () => {
      toast.error('Ödeme hatırlatıcısı devre dışı bırakılamadı')
    },
  })

  return { activateMutation, deactivateMutation }
}
