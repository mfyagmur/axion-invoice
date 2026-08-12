import { apiClient } from '@/lib/apiClient'

export interface FxRate {
  currency: string
  rate: string
  source: string
}

export const fxApi = {
  getRate: (currency: string) =>
    apiClient.get<FxRate>('/fx/rate', { params: { currency } }).then((res) => res.data),
}
