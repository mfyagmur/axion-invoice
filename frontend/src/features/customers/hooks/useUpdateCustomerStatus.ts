import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { customersApi } from '@/features/customers/api/customersApi'
import { useToastStore } from '@/store/toastStore'

export function useUpdateCustomerStatus() {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      customersApi.updateStatus(id, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
    onError: (error: AxiosError) => {
      const message = error.response?.status === 404
        ? 'Müşteri bulunamadı'
        : 'Müşteri durumu güncellenemedi'
      pushToast(message, 'error')
    },
  })
}
