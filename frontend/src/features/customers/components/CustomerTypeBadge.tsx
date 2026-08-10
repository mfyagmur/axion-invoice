import { useTranslation } from 'react-i18next'
import type { Customer } from '@/types/customer'

export function CustomerTypeBadge({ customer }: { customer: Pick<Customer, 'customer_type'> }) {
  const { t } = useTranslation()

  if (customer.customer_type !== 'bireysel') {
    return null
  }

  return (
    <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600">
      {t('customers.individualSuffix')}
    </span>
  )
}
