import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/Input'
import { useAuthStore } from '@/store/authStore'
import { useUpdateCompanySettings } from '@/features/profile/hooks/useUpdateCompanySettings'

const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP']
const DATE_FORMATS = ['DD.MM.YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
const MONTH_KEYS = [
  'month1', 'month2', 'month3', 'month4', 'month5', 'month6',
  'month7', 'month8', 'month9', 'month10', 'month11', 'month12',
]

const selectClassName =
  'rounded-md border border-slate-300 px-3 py-2 text-sm w-full max-w-xs focus:border-slate-500 focus:outline-none'

export type ScalarSettingKey = 'currency' | 'dateFormat' | 'taxYearStart' | 'invoiceNumber'

interface CompanyScalarSettingFormProps {
  settingKey: ScalarSettingKey
}

export function CompanyScalarSettingForm({ settingKey }: CompanyScalarSettingFormProps) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const updateCompanySettings = useUpdateCompanySettings()

  const [invoicePrefix, setInvoicePrefix] = useState(user?.invoice_prefix ?? '')

  if (!user) return null

  if (settingKey === 'currency') {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">{t('settings.definitions.currency')}</label>
        <select
          className={selectClassName}
          value={user.default_currency}
          onChange={(e) => updateCompanySettings.mutate({ default_currency: e.target.value })}
          disabled={updateCompanySettings.isPending}
        >
          {CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (settingKey === 'dateFormat') {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">{t('settings.definitions.dateFormat')}</label>
        <select
          className={selectClassName}
          value={user.date_format}
          onChange={(e) => updateCompanySettings.mutate({ date_format: e.target.value })}
          disabled={updateCompanySettings.isPending}
        >
          {DATE_FORMATS.map((format) => (
            <option key={format} value={format}>
              {format}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (settingKey === 'taxYearStart') {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">{t('settings.definitions.taxYearStart')}</label>
        <select
          className={selectClassName}
          value={user.tax_year_start_month}
          onChange={(e) => updateCompanySettings.mutate({ tax_year_start_month: Number(e.target.value) })}
          disabled={updateCompanySettings.isPending}
        >
          {MONTH_KEYS.map((key, index) => (
            <option key={key} value={index + 1}>
              {t(`settings.definitions.${key}`)}
            </option>
          ))}
        </select>
      </div>
    )
  }

  // invoiceNumber
  const preview = `${invoicePrefix}${String(user.invoice_sequence + 1).padStart(user.invoice_number_padding, '0')}`

  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <Input
        label={t('settings.definitions.invoicePrefix')}
        placeholder="FTR-"
        value={invoicePrefix}
        onChange={(e) => setInvoicePrefix(e.target.value)}
        onBlur={() => {
          if (invoicePrefix !== (user.invoice_prefix ?? '')) {
            updateCompanySettings.mutate({ invoice_prefix: invoicePrefix })
          }
        }}
        maxLength={20}
      />
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">{t('settings.definitions.invoicePadding')}</label>
        <select
          className={selectClassName}
          value={user.invoice_number_padding}
          onChange={(e) => updateCompanySettings.mutate({ invoice_number_padding: Number(e.target.value) })}
          disabled={updateCompanySettings.isPending}
        >
          {[3, 4, 5, 6].map((digits) => (
            <option key={digits} value={digits}>
              {digits}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-slate-500">
        {t('settings.definitions.invoicePreview')}: <span className="font-mono font-medium text-slate-700">{preview}</span>
      </p>
    </div>
  )
}
