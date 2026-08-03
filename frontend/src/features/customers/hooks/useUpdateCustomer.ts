import { useMutation, useQueryClient } from '@tanstack/react-query'
import { customersApi } from '@/features/customers/api/customersApi'
import type { CustomerUpdatePayload } from '@/types/customer'

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CustomerUpdatePayload }) =>
      customersApi.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}
