import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invoicesApi } from '@/features/invoices/api/invoicesApi'

const POLL_INTERVAL_MS = 1200
const MAX_POLL_ATTEMPTS = 8

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useSendInvoiceEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => invoicesApi.sendEmail(id),
    onSuccess: async (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: ['invoices'] })

      // E-posta gönderimi Celery task'ı ile async çalıştığı için backend'in
      // email_sent_at'i yazması sabit bir süre almıyor - o alan dolana kadar
      // (veya deneme sınırına ulaşılana kadar) kısa aralıklarla tekrar sorgulayıp
      // cache'i güncelliyoruz ki kullanıcı sayfayı elle yenilemek zorunda kalmasın.
      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        await wait(POLL_INTERVAL_MS)
        const invoice = await queryClient.fetchQuery({
          queryKey: ['invoices', id],
          queryFn: () => invoicesApi.get(id),
        })
        if (invoice?.email_sent_at) break
      }
      void queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}
