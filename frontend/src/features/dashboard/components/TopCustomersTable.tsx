import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/Card'
import { CurrencyAmountChips } from './CurrencyAmountChips'
import type { DashboardCustomerRow } from '@/features/dashboard/types/dashboard'

interface TopCustomersTableProps {
  customers: DashboardCustomerRow[]
}

export function TopCustomersTable({ customers }: TopCustomersTableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Card
      title={t('dashboard.demo.tables.customers')}
      subtitle={t('dashboard.demo.tables.customersSubtitle')}
      className="h-full"
    >
      <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
        {customers.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">{t('customers.list.empty')}</p>
        ) : (
          customers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => navigate(`/dashboard/customers/${customer.id}`)}
              className="flex cursor-pointer flex-col gap-2 py-3 first:pt-0 last:pb-0 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-900 dark:text-slate-100">{customer.name}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {customer.customer_type === 'bireysel'
                    ? t('dashboard.demo.tables.typeIndividual')
                    : t('dashboard.demo.tables.typeCorporate')}
                </span>
              </div>
              {customer.email && <span className="text-xs text-slate-500 dark:text-slate-400">{customer.email}</span>}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 dark:text-slate-500">{t('dashboard.demo.tables.invoicedTotal')}</span>
                  <CurrencyAmountChips breakdown={customer.invoiced_breakdown} emptyLabel="—" />
                </div>
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="text-slate-400 dark:text-slate-500">{t('dashboard.demo.tables.pendingTotal')}</span>
                  <CurrencyAmountChips breakdown={customer.pending_breakdown} emptyLabel="—" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
