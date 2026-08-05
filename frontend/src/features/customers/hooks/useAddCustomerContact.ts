import { useMutation, useQueryClient } from '@tanstack/react-query'
import { customersApi } from '@/features/customers/api/customersApi'
import type { CustomerContactPayload } from '@/types/customer'

export function useAddCustomerContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ customerId, payload }: { customerId: string; payload: CustomerContactPayload }) =>
      customersApi.addContact(customerId, payload),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['customers', customerId] })
    },
  })
}
