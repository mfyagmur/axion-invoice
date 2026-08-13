import { useQuery } from '@tanstack/react-query'
import { fxApi } from '@/features/invoices/api/fxApi'

export function useExchangeRate(from: string, to: string, enabled: boolean) {
  return useQuery({
    queryKey: ['fx-rate', from, to],
    queryFn: () => fxApi.getRate(from, to),
    enabled: enabled && from !== to,
    staleTime: 5 * 60 * 1000,
  })
}
