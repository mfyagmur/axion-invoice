import { apiClient } from '@/lib/apiClient'

export interface FxRate {
  currency: string
  rate: string
  source: string
}

export const fxApi = {
  getRate: (currency: string, base?: string) =>
    apiClient.get<FxRate>('/fx/rate', { params: { currency, base } }).then((res) => res.data),
}
