import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'
import { CountryAutocomplete } from '@/components/CountryAutocomplete'
import { Input } from '@/components/Input'
import { Modal } from '@/components/Modal'
import { useCreateCustomer } from '@/features/customers/hooks/useCreateCustomer'
import { useUpdateCustomer } from '@/features/customers/hooks/useUpdateCustomer'
import { customerSchema, type CustomerFormValues } from '@/features/customers/schemas/customerSchema'
import type { Customer } from '@/types/customer'

const EMPTY_VALUES: CustomerFormValues = {
  first_name: '',
  last_name: '',
  company_name: '',
  customer_type: 'kurumsal',
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

interface CustomerFormModalProps {
  isOpen: boolean
  onClose: () => void
  customer?: Customer | null
  onSuccess?: () => void
}

export function CustomerFormModal({ isOpen, onClose, customer, onSuccess }: CustomerFormModalProps) {
  const { t } = useTranslation()
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: EMPTY_VALUES,
  })

  const customerType = watch('customer_type')

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        reset({
          first_name: customer.first_name ?? '',
          last_name: customer.last_name ?? '',
          company_name: customer.company_name ?? '',
          customer_type: customer.customer_type ?? 'kurumsal',
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
      } else {
        reset(EMPTY_VALUES)
      }
    }
  }, [isOpen, customer, reset])

  const onSubmit = handleSubmit((values) => {
    const payload = {
      ...values,
      company_name: values.customer_type === 'bireysel'
        ? `${values.first_name} ${values.last_name}`.trim()
        : values.company_name,
      fax: values.fax || undefined,
      mersis_no: values.mersis_no || undefined,
    }
    if (customer) {
      updateCustomer.mutate(
        { id: customer.id, payload },
        {
          onSuccess: () => {
            onSuccess?.()
            onClose()
          }
        },
      )
    } else {
      createCustomer.mutate(payload, {
        onSuccess: () => {
          reset(EMPTY_VALUES)
          onSuccess?.()
          onClose()
        }
      })
    }
  })

  const isSaving = createCustomer.isPending || updateCustomer.isPending

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? t('customers.form.editTitle') : t('customers.form.newTitle')}
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

        {/* Bireysel / Kurumsal */}
        <div className="flex gap-2">
          <label className="flex-1">
            <input type="radio" value="bireysel" className="peer sr-only" {...register('customer_type')} />
            <span className="block cursor-pointer rounded-md border border-slate-300 px-3 py-2 text-center text-sm peer-checked:border-slate-900 peer-checked:bg-slate-900 peer-checked:text-white">
              {t('customers.form.customerTypeBireysel')}
            </span>
          </label>
          <label className="flex-1">
            <input type="radio" value="kurumsal" className="peer sr-only" {...register('customer_type')} />
            <span className="block cursor-pointer rounded-md border border-slate-300 px-3 py-2 text-center text-sm peer-checked:border-slate-900 peer-checked:bg-slate-900 peer-checked:text-white">
              {t('customers.form.customerTypeKurumsal')}
            </span>
          </label>
        </div>

        {/* Şirket Adı */}
        {customerType === 'kurumsal' && (
          <Input
            label={t('customers.form.companyName')}
            error={errors.company_name && t(errors.company_name.message ?? '')}
            {...register('company_name')}
          />
        )}

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
          <Controller
            control={control}
            name="website"
            render={({ field }) => (
              <Input
                label={t('customers.form.website')}
                type="url"
                prefix="https://"
                error={errors.website && t(errors.website.message ?? '')}
                placeholder='www.example.com'
                value={field.value}
                onChange={(e) => {
                  let val = e.target.value
                  if (val && !val.startsWith('https://') && !val.startsWith('http://')) {
                    val = 'https://' + val
                  }
                  field.onChange(val)
                }}
                onBlur={field.onBlur}
              />
            )}
          />
        </div>

        {/* Vergi Dairesi ve Vergi Numarası / T.C. Kimlik No */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('customers.form.taxOffice')}
            error={errors.tax_office && t(errors.tax_office.message ?? '')}
            {...register('tax_office')}
          />
          <Input
            label={customerType === 'bireysel' ? t('customers.form.nationalId') : t('customers.form.taxNumber')}
            error={errors.tax_number && t(errors.tax_number.message ?? '')}
            maxLength={customerType === 'bireysel' ? 11 : undefined}
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
            {customer ? t('customers.form.update') : t('customers.form.submit')}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('customers.form.cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
