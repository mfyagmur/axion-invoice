import { useQuery } from '@tanstack/react-query'
import { customersApi } from '@/features/customers/api/customersApi'

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customersApi.get(id!),
    enabled: !!id,
  })
}
