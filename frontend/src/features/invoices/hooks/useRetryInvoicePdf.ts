import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { invoicesApi } from '@/features/invoices/api/invoicesApi'

export function useRetryInvoicePdf() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => invoicesApi.retryPdf(id),
    onSuccess: (invoice) => {
      queryClient.setQueryData(['invoices', invoice.id], invoice)
      void queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: (error: AxiosError) => {
      toast.error(error.response?.status === 403 ? t('demo.actionBlocked') : 'PDF yeniden oluşturulamadı')
    },
  })
}
