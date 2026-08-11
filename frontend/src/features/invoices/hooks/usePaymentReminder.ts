import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invoicesApi } from '@/features/invoices/api/invoicesApi'

export function usePaymentReminder() {
  const queryClient = useQueryClient()

  const activateMutation = useMutation({
    mutationFn: (id: string) => invoicesApi.activatePaymentReminder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => invoicesApi.deactivatePaymentReminder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })

  return { activateMutation, deactivateMutation }
}
