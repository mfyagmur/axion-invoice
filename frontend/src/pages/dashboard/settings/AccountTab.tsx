import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useAuthStore } from '@/store/authStore'
import { useUpdateAccount } from '@/features/profile/hooks/useUpdateAccount'

export function AccountTab() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const [formData, setFormData] = useState({
    company_name: user?.company_name || '',
    address: user?.address || '',
    city: user?.city || '',
    postal_code: user?.postal_code || '',
    country: user?.country || '',
    phone: user?.phone || '',
    tax_office: user?.tax_office || '',
    tax_number: user?.tax_number || '',
  })

  const updateAccount = useUpdateAccount()

  if (!user) return null

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateAccount.mutate({
      company_name: formData.company_name || null,
      address: formData.address || null,
      city: formData.city || null,
      postal_code: formData.postal_code || null,
      country: formData.country || null,
      phone: formData.phone || null,
      tax_office: formData.tax_office || null,
      tax_number: formData.tax_number || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <Input
        label={t('settings.account.companyName')}
        value={formData.company_name}
        onChange={(e) => handleChange('company_name', e.target.value)}
        maxLength={255}
      />

      <Input
        label={t('settings.account.address')}
        value={formData.address}
        onChange={(e) => handleChange('address', e.target.value)}
        maxLength={1000}
      />

      <Input
        label={t('settings.account.city')}
        value={formData.city}
        onChange={(e) => handleChange('city', e.target.value)}
        maxLength={100}
      />

      <Input
        label={t('settings.account.postalCode')}
        value={formData.postal_code}
        onChange={(e) => handleChange('postal_code', e.target.value)}
        maxLength={20}
      />

      <Input
        label={t('settings.account.country')}
        value={formData.country}
        onChange={(e) => handleChange('country', e.target.value)}
        maxLength={100}
      />

      <Input
        label={t('settings.account.phone')}
        value={formData.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        maxLength={50}
      />

      <Input
        label={t('settings.account.taxOffice')}
        value={formData.tax_office}
        onChange={(e) => handleChange('tax_office', e.target.value)}
        maxLength={255}
      />

      <Input
        label={t('settings.account.taxNumber')}
        value={formData.tax_number}
        onChange={(e) => handleChange('tax_number', e.target.value)}
        maxLength={50}
      />

      <Button type="submit" disabled={updateAccount.isPending} className="mt-4 w-fit">
        {updateAccount.isPending ? t('common.loading') : t('common.save')}
      </Button>
    </form>
  )
}
