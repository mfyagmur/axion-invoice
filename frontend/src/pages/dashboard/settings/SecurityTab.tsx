import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Shield, Lock, Monitor, Laptop, Smartphone } from 'lucide-react'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Badge } from '@/components/Badge'
import { Switch } from '@/components/Switch'
import { useAuthStore } from '@/store/authStore'
import { useChangePassword } from '@/features/profile/hooks/useChangePassword'
import { useSessions, useRevokeSession, useRevokeOtherSessions } from '@/features/sessions/hooks'
import type { UserSession } from '@/types/session'

export function SecurityTab() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const changePassword = useChangePassword()
  const { data: sessions, isLoading: isSessionsLoading } = useSessions()
  const revokeSession = useRevokeSession()
  const revokeOthers = useRevokeOtherSessions()

  // TODO: backend TOTP entegrasyonu — docs/todo.md. Şimdilik sadece görsel, persist edilmiyor.
  const [is2faEnabled, setIs2faEnabled] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [passwordError, setPasswordError] = useState('')

  if (!user) return null

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }))
    setPasswordError('')
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError(t('auth.signup.errors.passwordMismatch'))
      return
    }

    if (passwordForm.new_password.length < 8) {
      setPasswordError(t('auth.signup.errors.passwordMin'))
      return
    }

    changePassword.mutate({
      current_password: user.has_password ? passwordForm.current_password : undefined,
      new_password: passwordForm.new_password,
      confirm_password: passwordForm.confirm_password,
    })

    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: '',
    })
  }

  const getDeviceInfo = (session: UserSession): { label: string; isMobile: boolean } => {
    const ua = session.user_agent?.toLowerCase() ?? ''
    const isMobile = ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')

    let os = 'Unknown Device'
    if (ua.includes('windows')) os = 'Windows PC'
    else if (ua.includes('mac')) os = 'Mac'
    else if (ua.includes('android')) os = 'Android'
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS'
    else if (ua.includes('linux')) os = 'Linux'

    let browser = ''
    if (ua.includes('edg')) browser = 'Microsoft Edge'
    else if (ua.includes('chrome')) browser = 'Google Chrome'
    else if (ua.includes('firefox')) browser = 'Firefox'
    else if (ua.includes('safari')) browser = 'Safari'

    return { label: browser ? `${os} - ${browser}` : os, isMobile }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(user.locale === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card
        className="rounded-xl border-gray-100 shadow-sm"
        icon={<Shield size={18} />}
        title={t('settings.security.twoFactor.title')}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-slate-600">{t('settings.security.twoFactor.description')}</p>
            <Switch checked={is2faEnabled} onChange={setIs2faEnabled} label={t('settings.security.twoFactor.title')} />
          </div>
          <Button type="button" variant="secondary" disabled className="w-fit">
            {t('settings.security.twoFactor.setupButton')}
          </Button>
        </div>
      </Card>

      <Card
        className="rounded-xl border-gray-100 shadow-sm"
        icon={<Lock size={18} />}
        title={user.has_password ? t('settings.security.changePassword') : t('settings.security.setPassword')}
      >
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {user.has_password && (
              <Input
                label={t('settings.security.currentPassword')}
                type="password"
                placeholder="••••••••"
                value={passwordForm.current_password}
                onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                required
              />
            )}

            <Input
              label={t('settings.security.newPassword')}
              type="password"
              placeholder="••••••••"
              value={passwordForm.new_password}
              onChange={(e) => handlePasswordChange('new_password', e.target.value)}
              required
            />

            <Input
              label={t('settings.security.confirmPassword')}
              type="password"
              placeholder="••••••••"
              value={passwordForm.confirm_password}
              onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
              required
            />

            {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}
          </div>

          <Button type="submit" disabled={changePassword.isPending} className="w-fit">
            {changePassword.isPending ? t('common.loading') : t('settings.security.changePassword')}
          </Button>
        </form>
      </Card>

      <Card
        className="rounded-xl border-gray-100 shadow-sm lg:col-span-2"
        icon={<Monitor size={18} />}
        title={t('settings.security.sessions')}
        action={
          sessions && sessions.length > 1 ? (
            <Button
              type="button"
              onClick={() => revokeOthers.mutate()}
              disabled={revokeOthers.isPending}
              className="border border-red-500 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
            >
              {t('settings.security.revokeAllDevices')}
            </Button>
          ) : undefined
        }
      >
        {isSessionsLoading ? (
          <p className="text-sm text-slate-500">{t('common.loading')}</p>
        ) : sessions && sessions.length > 0 ? (
          <div className="flex flex-col gap-2">
            {sessions.map((session) => {
              const device = getDeviceInfo(session)
              const DeviceIcon = device.isMobile ? Smartphone : Laptop
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-3"
                >
                  <div className="flex items-start gap-3">
                    <DeviceIcon size={18} className="mt-0.5 shrink-0 text-slate-500" />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{device.label}</span>
                        {session.is_current && <Badge color="green">{t('settings.security.thisBrowser')}</Badge>}
                      </div>
                      <p className="text-xs text-slate-500">{session.ip_address || 'IP unknown'}</p>
                      <p className="text-xs text-slate-500">
                        {session.is_current
                          ? t('settings.security.thisBrowser')
                          : `${t('settings.security.lastUsed')}: ${formatDate(session.last_used_at)}`}
                      </p>
                    </div>
                  </div>
                  {!session.is_current && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => revokeSession.mutate(session.id)}
                      disabled={revokeSession.isPending}
                      className="shrink-0 px-3 py-1 text-xs"
                    >
                      {t('settings.security.revoke')}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">{t('settings.security.noSessions')}</p>
        )}
      </Card>
    </div>
  )
}
