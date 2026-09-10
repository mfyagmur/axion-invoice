import { useMySubscription } from '@/features/billing/hooks/useMySubscription'

export function useInvoiceLimit() {
  const { data, isLoading } = useMySubscription()
  const max = data?.plan.max_invoices_per_month ?? null
  const used = data?.invoices_used_this_month ?? 0
  const isLimitReached = max !== null && used >= max

  return { isLimitReached, max, used, isLoading }
}
