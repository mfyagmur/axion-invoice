import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Select } from '@/components/Select'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { useAuthStore } from '@/store/authStore'
import { useUpdatePreferences } from '@/features/profile/hooks/useUpdatePreferences'

const SESSION_TIMEOUT_OPTIONS = [5, 10, 15, 20, 25, 30]
const AUTOSAVE_INTERVAL_OPTIONS = [1, 3, 5, 10, 15, 20, 25, 30]

export function PreferencesTab() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const updatePreferences = useUpdatePreferences()

  const [formData, setFormData] = useState({
    notify_invoice_reminders: user?.notify_invoice_reminders ?? true,
    session_timeout_minutes: user?.session_timeout_minutes ?? 5,
    template_autosave_interval_minutes: user?.template_autosave_interval_minutes ?? 5,
  })

  if (!user) return null

  const handleNotificationChange = (field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof formData],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updatePreferences.mutate({
      notify_invoice_reminders: formData.notify_invoice_reminders,
      session_timeout_minutes: formData.session_timeout_minutes,
      template_autosave_interval_minutes: formData.template_autosave_interval_minutes,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title={t('settings.preferences.notifications')}>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notify_invoice_reminders}
                onChange={() => handleNotificationChange('notify_invoice_reminders')}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer dark:border-slate-600 dark:bg-slate-800"
              />
              <span className="text-sm text-slate-700 dark:text-slate-200">{t('settings.preferences.invoiceReminders')}</span>
            </label>
            {formData.notify_invoice_reminders && user?.email && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('settings.preferences.invoiceRemindersEmailNote', { email: user.email })}
              </p>
            )}
          </div>
        </Card>

        <Card title={t('settings.preferences.durations')}>
          <div className="flex flex-col gap-5">
            <div>
              <Select
                label={t('settings.preferences.sessionTimeout')}
                value={String(formData.session_timeout_minutes)}
                onChange={(value) => setFormData((prev) => ({ ...prev, session_timeout_minutes: Number(value) }))}
                options={SESSION_TIMEOUT_OPTIONS.map((minutes) => ({
                  value: String(minutes),
                  label: t('settings.preferences.sessionTimeoutOption', { count: minutes }),
                }))}
                className="max-w-xs"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('settings.preferences.sessionTimeoutHint')}</p>
            </div>

            <div>
              <Select
                label={t('settings.preferences.autosaveInterval')}
                value={String(formData.template_autosave_interval_minutes)}
                onChange={(value) => setFormData((prev) => ({ ...prev, template_autosave_interval_minutes: Number(value) }))}
                options={AUTOSAVE_INTERVAL_OPTIONS.map((minutes) => ({
                  value: String(minutes),
                  label: t('settings.preferences.autosaveIntervalOption', { count: minutes }),
                }))}
                className="max-w-xs"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('settings.preferences.autosaveIntervalHint')}</p>
            </div>
          </div>
        </Card>

        <Card title={t('settings.preferences.system')}>
          <div className="flex flex-col gap-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700 dark:text-slate-200">
                {t('settings.preferences.themeLabel')}
              </span>
              <ThemeSwitcher />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('settings.preferences.systemDescription')}</p>
            <div className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {t('settings.preferences.systemInfo')}
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-start">
        <Button type="submit" disabled={updatePreferences.isPending} className="w-fit">
          {updatePreferences.isPending ? t('common.loading') : t('common.save')}
        </Button>
      </div>
    </form>
  )
}
