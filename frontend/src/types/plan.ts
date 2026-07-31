export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing'
export type BillingInterval = 'monthly' | 'yearly'

export interface Plan {
  id: string
  key: string
  name: string
  price_monthly: string
  price_yearly: string
  max_invoices_per_month: number | null
  max_templates: number | null
}

export interface Subscription {
  plan: Plan
  status: SubscriptionStatus
  billing_interval: BillingInterval | null
  current_period_end: string | null
  has_stripe_customer: boolean
  invoices_used_this_month: number
  templates_used: number
}

export interface CheckoutPayload {
  plan_key: 'pro' | 'business'
  interval: BillingInterval
}
