import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, MapPin, Phone, Pencil } from 'lucide-react'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { useAuthStore } from '@/store/authStore'
import { useLocaleStore } from '@/store/localeStore'
import { useUpdatePreferences } from '@/features/profile/hooks/useUpdatePreferences'
import type { Locale } from '@/types/auth'

const LANGUAGES = [
  { value: 'tr', label: 'Türkçe', flag: 'fi-tr' },
  { value: 'en', label: 'English', flag: 'fi-gb' },
]

const PROFESSION_VALUES = [
  'yazilim',
  'game_developer',
  'muhendis',
  'muhasebe',
  'mali_musavir',
  'grafik',
  'pazarlama',
  'satis',
  'insan_kaynaklari',
  'proje_yoneticisi',
  'ozel_muhasebeci',
  'danisman',
  'it_danisman',
  'other'
]

export function ProfileTab() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const { locale, setLocale } = useLocaleStore()
  const [profession, setProfession] = useState(user?.profession || '')
  const updatePreferences = useUpdatePreferences()

  const professions = PROFESSION_VALUES.map((value) => ({
    value,
    label: t(`settings.profile.professions.${value}`),
  }))

  if (!user) return null

  const handleSave = () => {
    updatePreferences.mutate({
      profession: profession || null,
    })
  }

  const isDirty = profession !== (user?.profession || '')

  return (
    <div className="flex flex-col gap-6">
      <Card className="rounded-xl shadow-md">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">{user.full_name}</h2>

          <div className="inline-block rounded bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {t(user.account_type === 'bireysel' ? 'settings.profile.accountTypeBireysel' : 'settings.profile.accountTypeKurumsal')}
          </div>

          {/* TODO: Konum/telefon salt-okunur placeholder; register akışına eklenecek */}
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div className="flex items-center gap-3">
              <Mail size={18} className="shrink-0 text-slate-500" />
              <span className="text-sm text-slate-700">{user.email}</span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={18} className="shrink-0 text-slate-500" />
              <span className="text-sm text-slate-700">{user.country || '-'}</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={18} className="shrink-0 text-slate-500" />
              <span className="text-sm text-slate-700">{user.phone || '_ _ ( _ _ _ ) _ _ _ _ _ _ _'}</span>
              <button
                type="button"
                className="shrink-0 rounded p-1 hover:bg-slate-100"
                title={t('common.edit')}
              >
                <Pencil size={16} className="text-slate-500" />
              </button>
            </div>
          </div>

          <p className="border-t border-slate-200 pt-4 text-xs text-slate-600">
            {t('settings.profile.supportText')}
          </p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-xl shadow-md">
          <div className="space-y-2">
            <label htmlFor="language" className="block text-sm font-semibold text-slate-900">
              {t('common.language')}
            </label>
            <select
              id="language"
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <Card className="rounded-xl shadow-md">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="profession" className="block text-sm font-semibold text-slate-900">
                {t('settings.profile.profession')}
              </label>
              <select
                id="profession"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              >
                <option value="">{t('settings.profile.selectPlaceholder')}</option>
                {professions.map((prof) => (
                  <option key={prof.value} value={prof.value}>
                    {prof.label}
                  </option>
                ))}
              </select>
            </div>
            {isDirty && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  disabled={updatePreferences.isPending}
                  onClick={handleSave}
                  className="w-fit"
                >
                  {updatePreferences.isPending ? t('common.loading') : t('common.save')}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={updatePreferences.isPending}
                  onClick={() => setProfession(user?.profession || '')}
                  className="w-fit"
                >
                  {t('common.cancel')}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
