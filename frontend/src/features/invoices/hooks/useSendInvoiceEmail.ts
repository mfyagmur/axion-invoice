import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invoicesApi } from '@/features/invoices/api/invoicesApi'

export function useSendInvoiceEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => invoicesApi.sendEmail(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: ['invoices'] })
      // E-posta gönderimi Celery task'ı ile async çalıştığı için,
      // status timeline'ın email_sent_at ile güncellenmesi için kısa bir gecikmeyle tekrar invalidate ediyoruz.
      setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: ['invoices', id] })
      }, 2000)
    },
  })
}
