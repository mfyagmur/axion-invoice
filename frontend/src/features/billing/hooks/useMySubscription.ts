import { useQuery } from '@tanstack/react-query'
import { billingApi } from '@/features/billing/api/billingApi'

export function useMySubscription() {
  return useQuery({ queryKey: ['subscription', 'me'], queryFn: billingApi.getMySubscription })
}
