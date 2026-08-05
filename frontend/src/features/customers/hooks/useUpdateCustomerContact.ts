import { useMutation, useQueryClient } from '@tanstack/react-query'
import { customersApi } from '@/features/customers/api/customersApi'
import type { CustomerContactPayload } from '@/types/customer'

export function useUpdateCustomerContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      customerId,
      contactId,
      payload,
    }: {
      customerId: string
      contactId: string
      payload: CustomerContactPayload
    }) => customersApi.updateContact(customerId, contactId, payload),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['customers', customerId] })
    },
  })
}
