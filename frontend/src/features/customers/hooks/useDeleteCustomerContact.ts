import { useMutation, useQueryClient } from '@tanstack/react-query'
import { customersApi } from '@/features/customers/api/customersApi'

export function useDeleteCustomerContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ customerId, contactId }: { customerId: string; contactId: string }) =>
      customersApi.deleteContact(customerId, contactId),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['customers', customerId] })
    },
  })
}
