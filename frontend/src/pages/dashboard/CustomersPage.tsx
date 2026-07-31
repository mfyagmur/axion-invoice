import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'
import { ErrorState } from '@/components/ErrorState'
import { Input } from '@/components/Input'
import { useCreateCustomer } from '@/features/customers/hooks/useCreateCustomer'
import { useCustomers } from '@/features/customers/hooks/useCustomers'
import { useDeleteCustomer } from '@/features/customers/hooks/useDeleteCustomer'
import type { CustomerCreatePayload } from '@/types/customer'

export function CustomersPage() {
  const { t } = useTranslation()
  const { data: customers, isLoading, isError, refetch } = useCustomers()
  const createCustomer = useCreateCustomer()
  const deleteCustomer = useDeleteCustomer()
  const { register, handleSubmit, reset } = useForm<CustomerCreatePayload>()

  const onSubmit = handleSubmit((values) => {
    createCustomer.mutate(values, { onSuccess: () => reset() })
  })

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold text-slate-900">{t('nav.customers')}</h1>

      <form onSubmit={onSubmit} className="flex max-w-xl flex-col items-stretch gap-3 sm:flex-row sm:items-end">
        <Input label={t('customers.form.name')} className="flex-1" {...register('name', { required: true })} />
        <Input label={t('customers.form.email')} type="email" className="flex-1" {...register('email')} />
        <Button type="submit" disabled={createCustomer.isPending}>
          {t('customers.form.submit')}
        </Button>
      </form>

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
              className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3"
            >
              <div className="flex flex-col">
                <span className="font-medium text-slate-900">{customer.name}</span>
                {customer.email && <span className="text-sm text-slate-500">{customer.email}</span>}
              </div>
              <Button variant="ghost" onClick={() => deleteCustomer.mutate(customer.id)}>
                {t('customers.list.delete')}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
