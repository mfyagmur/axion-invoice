import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Download, Plus } from 'lucide-react'
import { Button } from '@/components/Button'
import { ErrorState } from '@/components/ErrorState'
import { useCustomers } from '@/features/customers/hooks/useCustomers'
import { useUpdateCustomerStatus } from '@/features/customers/hooks/useUpdateCustomerStatus'
import { exportCustomersToExcel } from '@/features/customers/utils/exportCustomersToExcel'
import { getCustomerBaseName } from '@/features/customers/utils/formatCustomerDisplayName'
import { CustomerTypeBadge } from '@/features/customers/components/CustomerTypeBadge'
import { CustomerFormModal } from '@/features/customers/components/CustomerFormModal'
import type { Customer } from '@/types/customer'

export function CustomersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: customers, isLoading, isError, refetch } = useCustomers()
  const updateStatus = useUpdateCustomerStatus()
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">{t('nav.customers')}</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => customers && exportCustomersToExcel(customers)}
            disabled={!customers || customers.length === 0}
          >
            <Download size={16} className="mr-2" />
            {t('customers.list.exportExcel')}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setEditingCustomer(null)
              setIsModalOpen(true)
            }}
          >
            <Plus size={16} className="mr-2" />
            {t('customers.list.newCustomer')}
          </Button>
        </div>
      </div>

      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={editingCustomer}
      />

      {isLoading && <p className="text-sm text-slate-500">{t('common.loading')}</p>}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (customers?.length ?? 0) === 0 && (
        <p className="text-sm text-slate-500">{t('customers.list.empty')}</p>
      )}

      {!isLoading && !isError && (customers?.length ?? 0) > 0 && (
        <div className="flex flex-col gap-2">
          {customers?.map((customer) => (
            <div
              key={customer.id}
              onClick={() => navigate(`/dashboard/customers/${customer.id}`)}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <span className="text-sm font-semibold text-slate-600">
                    {((customer.first_name?.[0] || '') + (customer.last_name?.[0] || '')).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="flex items-center gap-2 font-medium text-slate-900">
                    {getCustomerBaseName(customer)}
                    <CustomerTypeBadge customer={customer} />
                  </span>
                  {customer.email && <span className="text-sm text-slate-500">{customer.email}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!customer.is_active && (
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                    {t('customers.list.statusPassive')}
                  </span>
                )}
                <Button
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingCustomer(customer)
                    setIsModalOpen(true)
                  }}
                >
                  {t('customers.list.edit')}
                </Button>
                <Button
                  variant={customer.is_active ? 'ghost' : 'secondary'}
                  onClick={(e) => {
                    e.stopPropagation()
                    updateStatus.mutate({ id: customer.id, isActive: !customer.is_active })
                  }}
                >
                  {customer.is_active ? t('customers.list.deactivate') : t('customers.list.activate')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
