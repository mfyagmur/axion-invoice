import { useMutation } from '@tanstack/react-query'
import { invoicesApi } from '@/features/invoices/api/invoicesApi'

export function useSendInvoiceEmail() {
  return useMutation({
    mutationFn: (id: string) => invoicesApi.sendEmail(id),
  })
}
