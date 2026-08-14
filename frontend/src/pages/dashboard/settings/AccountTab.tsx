import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, Briefcase, Calendar, Landmark, Hash, BadgeCheck, MapPin, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { useAuthStore } from '@/store/authStore'
import { useUpdateAccount } from '@/features/profile/hooks/useUpdateAccount'
import { useLocaleStore } from '@/store/localeStore'

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 text-blue-600">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="break-words text-base font-medium text-gray-900">{value}</p>
      </div>
    </div>
  )
}

export function AccountTab() {
  const { t } = useTranslation()
  const { locale } = useLocaleStore()
  const user = useAuthStore((state) => state.user)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    company_name: user?.company_name || '',
    address: user?.address || '',
    city: user?.city || '',
    postal_code: user?.postal_code || '',
    country: user?.country || '',
    phone: user?.phone || '',
    tax_office: user?.tax_office || '',
    tax_number: user?.tax_number || '',
    sector: user?.sector || '',
    trade_registry_no: user?.trade_registry_no || '',
    corporate_email: user?.corporate_email || '',
  })

  const updateAccount = useUpdateAccount()

  if (!user) return null

  const notSpecified = t('settings.account.companyProfile.notSpecified')
  const registrationDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : notSpecified

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateAccount.mutate(
      {
        company_name: formData.company_name || null,
        address: formData.address || null,
        city: formData.city || null,
        postal_code: formData.postal_code || null,
        country: formData.country || null,
        phone: formData.phone || null,
        tax_office: formData.tax_office || null,
        tax_number: formData.tax_number || null,
        sector: formData.sector || null,
        trade_registry_no: formData.trade_registry_no || null,
        corporate_email: formData.corporate_email || null,
      },
      { onSuccess: () => setIsEditing(false) },
    )
  }

  return (
    <Card className="rounded-xl shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t('settings.account.companyProfile.title')}</h2>
          <p className="text-sm text-slate-500">{t('settings.account.companyProfile.subtitle')}</p>
        </div>
        {!isEditing && (
          <Button
            type="button"
            variant="secondary"
            className="w-fit shrink-0"
            onClick={() => setIsEditing(true)}
          >
            {t('settings.account.companyProfile.updateButton')}
          </Button>
        )}
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">{t('settings.account.companyProfile.sectionBasic')}</h3>
            <InfoRow icon={<Building2 size={18} />} label={t('settings.account.companyProfile.companyTitle')} value={user.company_name || notSpecified} />
            <InfoRow icon={<Briefcase size={18} />} label={t('settings.account.companyProfile.sector')} value={user.sector || notSpecified} />
            <InfoRow icon={<Calendar size={18} />} label={t('settings.account.companyProfile.registrationDate')} value={registrationDate} />
          </div>

          <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">{t('settings.account.companyProfile.sectionTax')}</h3>
            <InfoRow icon={<Landmark size={18} />} label={t('settings.account.companyProfile.taxOffice')} value={user.tax_office || notSpecified} />
            <InfoRow icon={<Hash size={18} />} label={t('settings.account.companyProfile.taxNumber')} value={user.tax_number || notSpecified} />
            <InfoRow icon={<BadgeCheck size={18} />} label={t('settings.account.companyProfile.tradeRegistryNo')} value={user.trade_registry_no || notSpecified} />
          </div>

          <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50 p-4 md:col-span-2">
            <h3 className="text-sm font-semibold text-slate-700">{t('settings.account.companyProfile.sectionContact')}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow icon={<MapPin size={18} />} label={t('settings.account.companyProfile.address')} value={user.address || notSpecified} />
              <InfoRow icon={<MapPin size={18} />} label={t('settings.account.companyProfile.city')} value={user.city || notSpecified} />
              <InfoRow icon={<MapPin size={18} />} label={t('settings.account.companyProfile.country')} value={user.country || notSpecified} />
              <InfoRow icon={<Mail size={18} />} label={t('settings.account.companyProfile.corporateEmail')} value={user.corporate_email || notSpecified} />
              <InfoRow icon={<Phone size={18} />} label={t('settings.account.companyProfile.companyPhone')} value={user.phone || notSpecified} />
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label={t('settings.account.companyName')}
            value={formData.company_name}
            onChange={(e) => handleChange('company_name', e.target.value)}
            maxLength={255}
          />

          <Input
            label={t('settings.account.sector')}
            value={formData.sector}
            onChange={(e) => handleChange('sector', e.target.value)}
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
            label={t('settings.account.corporateEmail')}
            type="email"
            value={formData.corporate_email}
            onChange={(e) => handleChange('corporate_email', e.target.value)}
            maxLength={255}
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

          <Input
            label={t('settings.account.tradeRegistryNo')}
            value={formData.trade_registry_no}
            onChange={(e) => handleChange('trade_registry_no', e.target.value)}
            maxLength={100}
          />

          <div className="mt-4 flex gap-3">
            <Button type="submit" disabled={updateAccount.isPending} className="w-fit">
              {updateAccount.isPending ? t('common.loading') : t('common.save')}
            </Button>
            <Button type="button" variant="secondary" className="w-fit" onClick={() => setIsEditing(false)}>
              {t('settings.account.companyProfile.cancelButton')}
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}
