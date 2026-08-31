import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Building,
  Building2,
  CreditCard,
  FileText,
  Globe,
  Hash,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Printer,
  User,
} from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'
import { CountryAutocomplete } from '@/components/CountryAutocomplete'
import { FormCard } from '@/components/FormCard'
import { Modal } from '@/components/Modal'
import { SegmentedControl } from '@/components/SegmentedControl'
import { UnderlinedInput } from '@/components/UnderlinedInput'
import { useCreateCustomer } from '@/features/customers/hooks/useCreateCustomer'
import { useUpdateCustomer } from '@/features/customers/hooks/useUpdateCustomer'
import { useCategories } from '@/features/definitions/hooks/useCategories'
import { customerSchema, type CustomerFormValues } from '@/features/customers/schemas/customerSchema'
import { Select } from '@/components/Select'
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
  category_id: null,
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
  const { data: categories } = useCategories()

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
          category_id: customer.category_id ?? null,
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
      size="xl"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('customers.form.cancel')}
          </Button>
          <Button type="submit" form="customer-form" disabled={isSaving} className="bg-[#111827] hover:bg-[#1f2937]">
            {customer ? t('customers.form.update') : t('customers.form.submit')}
          </Button>
        </>
      }
    >
      <form id="customer-form" onSubmit={onSubmit} className="flex flex-col gap-5">
        <Controller
          control={control}
          name="customer_type"
          render={({ field }) => (
            <SegmentedControl
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'bireysel', label: t('customers.form.customerTypeBireysel'), icon: User },
                { value: 'kurumsal', label: t('customers.form.customerTypeKurumsal'), icon: Building2 },
              ]}
              className="max-w-md"
            />
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Kişisel & Kategori Bilgileri */}
          <FormCard icon={User} title={t('customers.form.sectionPersonal')}>
            <div className="grid grid-cols-2 gap-3">
              <UnderlinedInput
                label={t('customers.form.firstName')}
                icon={User}
                error={errors.first_name && t(errors.first_name.message ?? '')}
                {...register('first_name')}
              />
              <UnderlinedInput
                label={t('customers.form.lastName')}
                icon={User}
                error={errors.last_name && t(errors.last_name.message ?? '')}
                {...register('last_name')}
              />
            </div>
            <Controller
              control={control}
              name="category_id"
              render={({ field }) => (
                <Select
                  label={t('customers.form.category')}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  options={categories?.filter((c) => c.is_active).map((c) => ({ value: c.id, label: c.name })) || []}
                  placeholder={t('customers.form.categoryPlaceholder')}
                />
              )}
            />
          </FormCard>

          {/* Kurumsal & Finansal Bilgiler */}
          <FormCard icon={Building2} title={t('customers.form.sectionCorporate')}>
            <div className={customerType === 'kurumsal' ? undefined : 'invisible'}>
              <UnderlinedInput
                label={t('customers.form.companyName')}
                icon={Building2}
                error={errors.company_name && t(errors.company_name.message ?? '')}
                tabIndex={customerType === 'kurumsal' ? undefined : -1}
                aria-hidden={customerType !== 'kurumsal'}
                {...register('company_name')}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <UnderlinedInput
                label={t('customers.form.taxOffice')}
                icon={Landmark}
                error={errors.tax_office && t(errors.tax_office.message ?? '')}
                {...register('tax_office')}
              />
              <UnderlinedInput
                label={customerType === 'bireysel' ? t('customers.form.nationalId') : t('customers.form.taxNumber')}
                icon={CreditCard}
                error={errors.tax_number && t(errors.tax_number.message ?? '')}
                maxLength={customerType === 'bireysel' ? 11 : undefined}
                {...register('tax_number')}
              />
            </div>
            <UnderlinedInput label={t('customers.form.mersisNo')} icon={FileText} {...register('mersis_no')} />
          </FormCard>

          {/* İletişim Bilgileri */}
          <FormCard icon={Phone} title={t('customers.form.sectionContact')}>
            <UnderlinedInput
              label={t('customers.form.email')}
              icon={Mail}
              type="email"
              error={errors.email && t(errors.email.message ?? '')}
              {...register('email')}
            />
            <Controller
              control={control}
              name="website"
              render={({ field }) => (
                <UnderlinedInput
                  label={t('customers.form.website')}
                  icon={Globe}
                  type="url"
                  prefix="https://"
                  error={errors.website && t(errors.website.message ?? '')}
                  placeholder="www.example.com"
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
            <div className="grid grid-cols-2 gap-3">
              <UnderlinedInput
                label={t('customers.form.phone')}
                icon={Phone}
                error={errors.phone && t(errors.phone.message ?? '')}
                {...register('phone')}
              />
              <UnderlinedInput label={t('customers.form.fax')} icon={Printer} {...register('fax')} />
            </div>
          </FormCard>

          {/* Adres Detayları */}
          <FormCard icon={MapPin} title={t('customers.form.sectionAddress')}>
            <UnderlinedInput
              label={t('customers.form.address')}
              icon={MapPin}
              error={errors.address && t(errors.address.message ?? '')}
              {...register('address')}
            />
            <div className="grid grid-cols-3 gap-3">
              <UnderlinedInput label={t('customers.form.city')} icon={Building} {...register('city')} />
              <UnderlinedInput label={t('customers.form.postalCode')} icon={Hash} {...register('postal_code')} />
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
            </div>
          </FormCard>
        </div>
      </form>
    </Modal>
  )
}
