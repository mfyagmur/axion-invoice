import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'
import { ErrorState } from '@/components/ErrorState'
import { Input } from '@/components/Input'
import { useCreateCustomer } from '@/features/customers/hooks/useCreateCustomer'
import { useCustomers } from '@/features/customers/hooks/useCustomers'
import { useUpdateCustomer } from '@/features/customers/hooks/useUpdateCustomer'
import { useUpdateCustomerStatus } from '@/features/customers/hooks/useUpdateCustomerStatus'
import { customerSchema, type CustomerFormValues } from '@/features/customers/schemas/customerSchema'
import type { Customer } from '@/types/customer'

const EMPTY_VALUES: CustomerFormValues = {
  name: '',
  email: '',
  address: '',
  phone: '',
  tax_office: '',
  tax_number: '',
  fax: '',
  mersis_no: '',
}

export function CustomersPage() {
  const { t } = useTranslation()
  const { data: customers, isLoading, isError, refetch } = useCustomers()
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()
  const updateStatus = useUpdateCustomerStatus()
  const [editingId, setEditingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: EMPTY_VALUES,
  })

  const startEdit = (customer: Customer) => {
    setEditingId(customer.id)
    reset({
      name: customer.name,
      email: customer.email ?? '',
      address: customer.address ?? '',
      phone: customer.phone ?? '',
      tax_office: customer.tax_office ?? '',
      tax_number: customer.tax_number ?? '',
      fax: customer.fax ?? '',
      mersis_no: customer.mersis_no ?? '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    reset(EMPTY_VALUES)
  }

  const onSubmit = handleSubmit((values) => {
    const payload = {
      ...values,
      fax: values.fax || undefined,
      mersis_no: values.mersis_no || undefined,
    }
    if (editingId) {
      updateCustomer.mutate(
        { id: editingId, payload },
        { onSuccess: () => cancelEdit() },
      )
    } else {
      createCustomer.mutate(payload, { onSuccess: () => reset(EMPTY_VALUES) })
    }
  })

  const isSaving = createCustomer.isPending || updateCustomer.isPending

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold text-slate-900">{t('nav.customers')}</h1>

      <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-3">
        {editingId && (
          <p className="text-sm font-medium text-slate-700">{t('customers.form.editTitle')}</p>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label={t('customers.form.name')}
            error={errors.name && t(errors.name.message ?? '')}
            {...register('name')}
          />
          <Input
            label={t('customers.form.email')}
            type="email"
            error={errors.email && t(errors.email.message ?? '')}
            {...register('email')}
          />
          <Input
            label={t('customers.form.address')}
            error={errors.address && t(errors.address.message ?? '')}
            {...register('address')}
          />
          <Input
            label={t('customers.form.phone')}
            error={errors.phone && t(errors.phone.message ?? '')}
            {...register('phone')}
          />
          <Input
            label={t('customers.form.taxOffice')}
            error={errors.tax_office && t(errors.tax_office.message ?? '')}
            {...register('tax_office')}
          />
          <Input
            label={t('customers.form.taxNumber')}
            error={errors.tax_number && t(errors.tax_number.message ?? '')}
            {...register('tax_number')}
          />
          <Input label={t('customers.form.fax')} {...register('fax')} />
          <Input label={t('customers.form.mersisNo')} {...register('mersis_no')} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSaving}>
            {editingId ? t('customers.form.update') : t('customers.form.submit')}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={cancelEdit}>
              {t('customers.form.cancel')}
            </Button>
          )}
        </div>
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
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
                <Button variant="secondary" onClick={() => startEdit(customer)}>
                  {t('customers.list.edit')}
                </Button>
                <Button
                  variant={customer.is_active ? 'ghost' : 'secondary'}
                  onClick={() => updateStatus.mutate({ id: customer.id, isActive: !customer.is_active })}
                >
                  {customer.is_active ? t('customers.list.deactivate') : t('customers.list.activate')}
                </Button>
                {!customer.is_active && <span className="text-xs text-slate-400">{t('customers.list.statusPassive')}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
