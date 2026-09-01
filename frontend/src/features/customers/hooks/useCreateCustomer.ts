import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { customersApi } from '@/features/customers/api/customersApi'
import { useToastStore } from '@/store/toastStore'

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)
  const { t } = useTranslation()

  return useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 403) {
        pushToast(t('demo.actionBlocked'), 'error')
      }
    },
  })
}
