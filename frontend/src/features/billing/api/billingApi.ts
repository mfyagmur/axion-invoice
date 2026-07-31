import { apiClient } from '@/lib/apiClient'
import type { CheckoutPayload, Plan, Subscription } from '@/types/plan'

export const billingApi = {
  listPlans: () => apiClient.get<Plan[]>('/plans').then((res) => res.data),

  getMySubscription: () => apiClient.get<Subscription>('/subscriptions/me').then((res) => res.data),

  checkout: (payload: CheckoutPayload) =>
    apiClient.post<{ url: string }>('/subscriptions/checkout', payload).then((res) => res.data),

  portal: () => apiClient.post<{ url: string }>('/subscriptions/portal').then((res) => res.data),
}
