import { useQuery } from '@tanstack/react-query'
import { billingApi } from '@/features/billing/api/billingApi'

export function usePlans() {
  return useQuery({ queryKey: ['plans'], queryFn: billingApi.listPlans })
}
