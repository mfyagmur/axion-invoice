import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useAuthStore } from '@/store/authStore'
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile'

export function ProfileTab() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const [fullName, setFullName] = useState(user?.full_name || '')
  const updateProfile = useUpdateProfile()

  if (!user) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (fullName.trim()) {
      updateProfile.mutate({ full_name: fullName })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label={t('settings.profile.fullName')}
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
        minLength={1}
        maxLength={255}
      />

      <Input
        label={t('settings.profile.email')}
        value={user.email}
        disabled
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">{t('settings.profile.accountType')}</label>
        <div className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          {user.account_type === 'bireysel' ? 'Bireysel' : 'Kurumsal'}
        </div>
      </div>

      <Button type="submit" disabled={updateProfile.isPending} className="mt-4 w-fit">
        {updateProfile.isPending ? t('common.loading') : t('common.save')}
      </Button>
    </form>
  )
}
