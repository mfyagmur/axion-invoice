import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Badge } from '@/components/Badge'
import { useAuthStore } from '@/store/authStore'
import { useChangePassword } from '@/features/profile/hooks/useChangePassword'
import { useSessions, useRevokeSession, useRevokeOtherSessions } from '@/features/sessions/hooks'

export function SecurityTab() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const changePassword = useChangePassword()
  const { data: sessions, isLoading: isSessionsLoading } = useSessions()
  const revokeSession = useRevokeSession()
  const revokeOthers = useRevokeOtherSessions()

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

  const getDeviceLabel = (session: any): string => {
    if (!session.user_agent) return 'Unknown Device'
    const ua = session.user_agent.toLowerCase()
    if (ua.includes('chrome')) return 'Chrome'
    if (ua.includes('safari')) return 'Safari'
    if (ua.includes('firefox')) return 'Firefox'
    if (ua.includes('edg')) return 'Edge'
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'Mobile'
    return 'Browser'
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
    <div className="flex flex-col gap-8 max-w-xl">
      <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-4">
            {user.has_password ? t('settings.security.changePassword') : t('settings.security.setPassword')}
          </h3>

          {user.has_password && (
            <Input
              label={t('settings.security.currentPassword')}
              type="password"
              value={passwordForm.current_password}
              onChange={(e) => handlePasswordChange('current_password', e.target.value)}
              required
              className="mb-2"
            />
          )}

          <Input
            label={t('settings.security.newPassword')}
            type="password"
            value={passwordForm.new_password}
            onChange={(e) => handlePasswordChange('new_password', e.target.value)}
            required
            className="mb-2"
          />

          <Input
            label={t('settings.security.confirmPassword')}
            type="password"
            value={passwordForm.confirm_password}
            onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
            required
          />

          {passwordError && <p className="text-xs text-red-600 mt-2">{passwordError}</p>}
        </div>

        <Button type="submit" disabled={changePassword.isPending} className="w-fit">
          {changePassword.isPending ? t('common.loading') : t('common.save')}
        </Button>
      </form>

      <div className="border-t border-slate-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-700">{t('settings.security.sessions')}</h3>
          {sessions && sessions.length > 1 && (
            <Button
              variant="secondary"
              onClick={() => revokeOthers.mutate()}
              disabled={revokeOthers.isPending}
              className="px-3 py-1 text-xs"
            >
              {t('settings.security.revokeOthers')}
            </Button>
          )}
        </div>

        {isSessionsLoading ? (
          <p className="text-sm text-slate-500">{t('common.loading')}</p>
        ) : sessions && sessions.length > 0 ? (
          <div className="flex flex-col gap-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{getDeviceLabel(session)}</span>
                    {session.is_current && <Badge>{t('settings.security.thisBrowser')}</Badge>}
                  </div>
                  <p className="text-xs text-slate-500">{session.ip_address || 'IP unknown'}</p>
                  <p className="text-xs text-slate-500">
                    {t('settings.security.lastUsed')}: {formatDate(session.last_used_at)}
                  </p>
                </div>
                {!session.is_current && (
                  <Button
                    variant="secondary"
                    onClick={() => revokeSession.mutate(session.id)}
                    disabled={revokeSession.isPending}
                    className="px-3 py-1 text-xs"
                  >
                    {t('settings.security.revoke')}
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">{t('settings.security.noSessions')}</p>
        )}
      </div>
    </div>
  )
}
