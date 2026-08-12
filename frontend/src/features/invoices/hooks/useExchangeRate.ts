import { useQuery } from '@tanstack/react-query'
import { fxApi } from '@/features/invoices/api/fxApi'

export function useExchangeRate(currency: string, enabled: boolean) {
  return useQuery({
    queryKey: ['fx-rate', currency],
    queryFn: () => fxApi.getRate(currency),
    enabled: enabled && currency !== 'TRY',
    staleTime: 5 * 60 * 1000,
  })
}
