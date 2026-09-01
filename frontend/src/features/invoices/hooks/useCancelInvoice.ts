import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { invoicesApi } from '@/features/invoices/api/invoicesApi'

export function useCancelInvoice() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => invoicesApi.cancel(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Fatura iptal edildi')
    },
    onError: (error: AxiosError) => {
      toast.error(error.response?.status === 403 ? t('demo.actionBlocked') : 'Fatura iptal edilemedi')
    },
  })
}
