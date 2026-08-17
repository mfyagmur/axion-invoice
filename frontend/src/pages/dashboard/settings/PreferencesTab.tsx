import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'
import { useAuthStore } from '@/store/authStore'
import { useLocaleStore } from '@/store/localeStore'
import { useUpdatePreferences } from '@/features/profile/hooks/useUpdatePreferences'
import type { Locale } from '@/types/auth'

const LOCALES: Locale[] = ['tr', 'en']

export function PreferencesTab() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const currentLocale = useLocaleStore((state) => state.locale)
  const updatePreferences = useUpdatePreferences()

  const [formData, setFormData] = useState({
    locale: currentLocale,
    notify_invoice_reminders: user?.notify_invoice_reminders ?? true,
    notify_product_updates: user?.notify_product_updates ?? true,
    notify_billing_emails: user?.notify_billing_emails ?? true,
    session_timeout_minutes: user?.session_timeout_minutes ?? 5,
  })

  if (!user) return null

  const handleLocaleChange = (locale: Locale) => {
    setFormData((prev) => ({ ...prev, locale }))
    useLocaleStore.getState().setLocale(locale)
  }

  const handleNotificationChange = (field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof formData],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updatePreferences.mutate({
      locale: formData.locale,
      notify_invoice_reminders: formData.notify_invoice_reminders,
      notify_product_updates: formData.notify_product_updates,
      notify_billing_emails: formData.notify_billing_emails,
      session_timeout_minutes: formData.session_timeout_minutes,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-xl">
      {/* Dil seçimi Profil sekmesine taşındı — burda pasif */}
      {/* <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-slate-700">{t('common.language')}</label>
        <div className="flex items-center gap-1 rounded-md border border-slate-300 p-0.5 w-fit">
          {LOCALES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleLocaleChange(option)}
              className={`rounded px-3 py-1.5 uppercase text-sm font-medium transition-colors ${
                formData.locale === option
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div> */}

      <div>
        <h3 className="mb-4 text-sm font-medium text-slate-700">{t('settings.preferences.notifications')}</h3>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notify_invoice_reminders}
              onChange={() => handleNotificationChange('notify_invoice_reminders')}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer"
            />
            <span className="text-sm text-slate-700">{t('settings.preferences.invoiceReminders')}</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notify_product_updates}
              onChange={() => handleNotificationChange('notify_product_updates')}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer"
            />
            <span className="text-sm text-slate-700">{t('settings.preferences.productUpdates')}</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notify_billing_emails}
              onChange={() => handleNotificationChange('notify_billing_emails')}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer"
            />
            <span className="text-sm text-slate-700">{t('settings.preferences.billingEmails')}</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-medium text-slate-700">{t('settings.preferences.sessionTimeout')}</h3>
        <select
          value={formData.session_timeout_minutes}
          onChange={(e) => setFormData((prev) => ({ ...prev, session_timeout_minutes: Number(e.target.value) }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm w-fit"
        >
          {[5, 10, 15, 20, 25, 30].map((minutes) => (
            <option key={minutes} value={minutes}>
              {t('settings.preferences.sessionTimeoutOption', { count: minutes })}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-slate-500">{t('settings.preferences.sessionTimeoutHint')}</p>
      </div>

      <Button type="submit" disabled={updatePreferences.isPending} className="mt-4 w-fit">
        {updatePreferences.isPending ? t('common.loading') : t('common.save')}
      </Button>
    </form>
  )
}
