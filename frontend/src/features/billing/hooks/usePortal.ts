import { useMutation } from '@tanstack/react-query'
import { billingApi } from '@/features/billing/api/billingApi'

export function usePortal() {
  return useMutation({
    mutationFn: billingApi.portal,
    onSuccess: (data) => {
      window.location.href = data.url
    },
  })
}
