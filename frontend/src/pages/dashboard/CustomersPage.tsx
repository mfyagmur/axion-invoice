import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Download, Plus } from 'lucide-react'
import { Button } from '@/components/Button'
import { CountryAutocomplete } from '@/components/CountryAutocomplete'
import { ErrorState } from '@/components/ErrorState'
import { Input } from '@/components/Input'
import { Modal } from '@/components/Modal'
import { useCreateCustomer } from '@/features/customers/hooks/useCreateCustomer'
import { useCustomers } from '@/features/customers/hooks/useCustomers'
import { useUpdateCustomer } from '@/features/customers/hooks/useUpdateCustomer'
import { useUpdateCustomerStatus } from '@/features/customers/hooks/useUpdateCustomerStatus'
import { customerSchema, type CustomerFormValues } from '@/features/customers/schemas/customerSchema'
import { exportCustomersToExcel } from '@/features/customers/utils/exportCustomersToExcel'
import type { Customer } from '@/types/customer'

const EMPTY_VALUES: CustomerFormValues = {
  first_name: '',
  last_name: '',
  company_name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postal_code: '',
  country: '',
  website: '',
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
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    register,
    control,
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
      first_name: customer.first_name ?? '',
      last_name: customer.last_name ?? '',
      company_name: customer.company_name ?? '',
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      address: customer.address ?? '',
      city: customer.city ?? '',
      postal_code: customer.postal_code ?? '',
      country: customer.country ?? '',
      website: customer.website ?? '',
      tax_office: customer.tax_office ?? '',
      tax_number: customer.tax_number ?? '',
      fax: customer.fax ?? '',
      mersis_no: customer.mersis_no ?? '',
    })
    setIsModalOpen(true)
  }

  const cancelEdit = () => {
    setEditingId(null)
    reset(EMPTY_VALUES)
    setIsModalOpen(false)
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
      createCustomer.mutate(payload, { onSuccess: () => {
        reset(EMPTY_VALUES)
        setIsModalOpen(false)
      } })
    }
  })

  const isSaving = createCustomer.isPending || updateCustomer.isPending

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
              setEditingId(null)
              reset(EMPTY_VALUES)
              setIsModalOpen(true)
            }}
          >
            <Plus size={16} className="mr-2" />
            {t('customers.list.newCustomer')}
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={cancelEdit}
        title={editingId ? t('customers.form.editTitle') : t('customers.form.newTitle')}
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {/* Ad Soyad */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('customers.form.firstName')}
              error={errors.first_name && t(errors.first_name.message ?? '')}
              {...register('first_name')}
            />
            <Input
              label={t('customers.form.lastName')}
              error={errors.last_name && t(errors.last_name.message ?? '')}
              {...register('last_name')}
            />
          </div>

          {/* Şirket Adı */}
          <Input
            label={t('customers.form.companyName')}
            {...register('company_name')}
          />

          {/* E-posta ve Telefon */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('customers.form.email')}
              type="email"
              error={errors.email && t(errors.email.message ?? '')}
              {...register('email')}
            />
            <Input
              label={t('customers.form.phone')}
              error={errors.phone && t(errors.phone.message ?? '')}
              {...register('phone')}
            />
          </div>

          {/* Adres (Uzun) */}
          <Input
            label={t('customers.form.address')}
            error={errors.address && t(errors.address.message ?? '')}
            {...register('address')}
          />

          {/* Şehir ve Posta Kodu */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('customers.form.city')}
              {...register('city')}
            />
            <Input
              label={t('customers.form.postalCode')}
              {...register('postal_code')}
            />
          </div>

          {/* Ülke ve Web Adresi */}
          <div className="grid grid-cols-2 gap-3">
            <Controller
              control={control}
              name="country"
              render={({ field }) => (
                <CountryAutocomplete
                  label={t('customers.form.country')}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <Input
              label={t('customers.form.website')}
              type="url"
              {...register('website')}
            />
          </div>

          {/* Vergi Dairesi ve Vergi Numarası */}
          <div className="grid grid-cols-2 gap-3">
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
          </div>

          {/* Faks ve MERSIS No */}
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('customers.form.fax')} {...register('fax')} />
            <Input label={t('customers.form.mersisNo')} {...register('mersis_no')} />
          </div>

          {/* Butonlar */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSaving}>
              {editingId ? t('customers.form.update') : t('customers.form.submit')}
            </Button>
            <Button type="button" variant="secondary" onClick={cancelEdit}>
              {t('customers.form.cancel')}
            </Button>
          </div>
        </form>
      </Modal>

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
              className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <span className="text-sm font-semibold text-slate-600">
                    {((customer.first_name?.[0] || '') + (customer.last_name?.[0] || '')).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-900">{customer.name}</span>
                  {customer.email && <span className="text-sm text-slate-500">{customer.email}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!customer.is_active && (
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                    {t('customers.list.statusPassive')}
                  </span>
                )}
                <Button variant="secondary" onClick={() => startEdit(customer)}>
                  {t('customers.list.edit')}
                </Button>
                <Button
                  variant={customer.is_active ? 'ghost' : 'secondary'}
                  onClick={() => updateStatus.mutate({ id: customer.id, isActive: !customer.is_active })}
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
