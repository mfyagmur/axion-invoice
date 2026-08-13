import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/Button'
import { useCheckout } from '@/features/billing/hooks/useCheckout'
import { useMySubscription } from '@/features/billing/hooks/useMySubscription'
import { usePlans } from '@/features/billing/hooks/usePlans'
import { usePortal } from '@/features/billing/hooks/usePortal'
import type { BillingInterval } from '@/types/plan'

function formatLimit(value: number | null, unlimitedKey: string, t: (key: string) => string): string {
  return value === null ? t(unlimitedKey) : String(value)
}

export function BillingPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const checkoutResult = searchParams.get('checkout')
  const [interval, setBillingInterval] = useState<BillingInterval>('monthly')

  const { data: subscription, isLoading: isSubscriptionLoading } = useMySubscription()
  const { data: plans, isLoading: isPlansLoading } = usePlans()
  const checkout = useCheckout()
  const portal = usePortal()

  if (isSubscriptionLoading || isPlansLoading || !subscription || !plans) {
    return <p className="text-sm text-slate-500">{t('common.loading')}</p>
  }

  return (
    <div className="flex flex-col gap-6">
      {checkoutResult === 'success' && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          {t('billing.checkoutSuccess')}
        </p>
      )}
      {checkoutResult === 'cancel' && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{t('billing.checkoutCancel')}</p>
      )}

      <div className="flex flex-col gap-2 rounded-md border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-900">{t('billing.currentPlan')}</h2>
        <p className="text-lg font-medium text-slate-900">{subscription.plan.name}</p>
        <div className="flex flex-col gap-1 text-sm text-slate-600">
          <span>
            {t('billing.usageInvoices')}: {subscription.invoices_used_this_month} /{' '}
            {formatLimit(subscription.plan.max_invoices_per_month, 'billing.unlimited', t)}
          </span>
          <span>
            {t('billing.usageTemplates')}: {subscription.templates_used} /{' '}
            {formatLimit(subscription.plan.max_templates, 'billing.unlimited', t)}
          </span>
        </div>
        {subscription.has_stripe_customer && (
          <Button variant="secondary" className="mt-2 w-fit" onClick={() => portal.mutate()} disabled={portal.isPending}>
            {t('billing.manageSubscription')}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => setBillingInterval('monthly')}
          className={`rounded-md px-3 py-1 ${interval === 'monthly' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
        >
          {t('billing.monthly')}
        </button>
        <button
          type="button"
          onClick={() => setBillingInterval('yearly')}
          className={`rounded-md px-3 py-1 ${interval === 'yearly' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
        >
          {t('billing.yearly')}
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.key === subscription.plan.key
          const price = interval === 'monthly' ? plan.price_monthly : plan.price_yearly
          return (
            <div key={plan.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900">{plan.name}</h3>
              <p className="text-2xl font-bold text-slate-900">
                {Number(price).toFixed(0)}₺
                <span className="text-sm font-normal text-slate-500">
                  {interval === 'monthly' ? t('billing.perMonth') : t('billing.perYear')}
                </span>
              </p>
              <ul className="flex flex-col gap-1 text-sm text-slate-600">
                <li>
                  {t('billing.usageInvoices')}: {formatLimit(plan.max_invoices_per_month, 'billing.unlimited', t)}
                </li>
                <li>
                  {t('billing.usageTemplates')}: {formatLimit(plan.max_templates, 'billing.unlimited', t)}
                </li>
              </ul>
              <Button
                disabled={isCurrent || plan.key === 'free' || checkout.isPending}
                onClick={() => checkout.mutate({ plan_key: plan.key as 'pro' | 'business', interval })}
              >
                {isCurrent ? t('billing.currentPlanBadge') : t('billing.upgrade')}
              </Button>
            </div>
          )
        })}
      </div>
      {checkout.isError && <p className="text-sm text-red-600">{t('common.genericError')}</p>}
    </div>
  )
}
