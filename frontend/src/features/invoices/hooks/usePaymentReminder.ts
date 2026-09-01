import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { invoicesApi } from '@/features/invoices/api/invoicesApi'

export function usePaymentReminder() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const activateMutation = useMutation({
    mutationFn: (id: string) => invoicesApi.activatePaymentReminder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: (error: AxiosError) => {
      toast.error(error.response?.status === 403 ? t('demo.actionBlocked') : 'Ödeme hatırlatıcısı aktif edilemedi')
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => invoicesApi.deactivatePaymentReminder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: (error: AxiosError) => {
      toast.error(error.response?.status === 403 ? t('demo.actionBlocked') : 'Ödeme hatırlatıcısı devre dışı bırakılamadı')
    },
  })

  return { activateMutation, deactivateMutation }
}
