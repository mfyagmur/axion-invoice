import type { TFunction } from 'i18next'
import type { Customer } from '@/types/customer'

export function formatCustomerDisplayName(
  customer: Pick<Customer, 'company_name' | 'name' | 'customer_type'>,
  t: TFunction,
): string {
  const base = customer.company_name || customer.name
  return customer.customer_type === 'bireysel'
    ? `${base} (${t('customers.individualSuffix')})`
    : base
}

export function getCustomerBaseName(customer: Pick<Customer, 'company_name' | 'name'>): string {
  return customer.company_name || customer.name
}
