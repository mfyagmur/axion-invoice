import { useMutation } from '@tanstack/react-query'
import { billingApi } from '@/features/billing/api/billingApi'

export function useCheckout() {
  return useMutation({
    mutationFn: billingApi.checkout,
    onSuccess: (data) => {
      window.location.href = data.url
    },
  })
}
