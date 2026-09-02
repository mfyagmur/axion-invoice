import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Shield, Lock, Monitor, Laptop, Smartphone, Mail, MessageSquare, KeyRound } from 'lucide-react'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Badge } from '@/components/Badge'
import { Switch } from '@/components/Switch'
import { useAuthStore } from '@/store/authStore'
import { useDateFormat } from '@/hooks/useDateFormat'
import { useChangePassword } from '@/features/profile/hooks/useChangePassword'
import { useSessions, useRevokeSession, useRevokeOtherSessions } from '@/features/sessions/hooks'
import { useSetupTwoFactorEmail, useConfirmTwoFactorEmail, useToggleTwoFactor } from '@/features/twoFactor/hooks'
import type { UserSession } from '@/types/session'

export function SecurityTab() {
  const { t } = useTranslation()
  const { formatDateVerbal } = useDateFormat()
  const user = useAuthStore((state) => state.user)
  const changePassword = useChangePassword()
  const { data: sessions, isLoading: isSessionsLoading } = useSessions()
  const revokeSession = useRevokeSession()
  const revokeOthers = useRevokeOtherSessions()
  const isDemo = user?.is_demo ?? false

  const setupTwoFactorEmail = useSetupTwoFactorEmail()
  const confirmTwoFactorEmail = useConfirmTwoFactorEmail()
  const toggleTwoFactor = useToggleTwoFactor()
  const [emailSetupOpen, setEmailSetupOpen] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [otpInput, setOtpInput] = useState('')

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

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card
        className="rounded-xl border-gray-100 shadow-sm"
        icon={<Shield size={18} />}
        title={t('settings.security.twoFactor.title')}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <p className={`text-sm ${isDemo ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>{t('settings.security.twoFactor.description')}</p>
            <Switch
              checked={user.is_2fa_enabled}
              onChange={(enabled) => toggleTwoFactor.mutate({ enabled })}
              disabled={isDemo || !user.two_factor_email || toggleTwoFactor.isPending}
              label={t('settings.security.twoFactor.title')}
            />
          </div>
          {!isDemo && !user.two_factor_email && (
            <p className="text-xs text-amber-700 dark:text-amber-400">{t('settings.security.twoFactor.enableRequiresEmail')}</p>
          )}

          <div className="flex flex-col divide-y divide-gray-100 dark:divide-slate-700">
            {/* E-posta yöntemi */}
            <div className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Mail size={18} className="mt-0.5 shrink-0 text-slate-500 dark:text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {t('settings.security.twoFactor.methods.email.title')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t('settings.security.twoFactor.methods.email.description')}
                    </p>
                    {user.two_factor_email && !emailSetupOpen && (
                      <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                        {t('settings.security.twoFactor.methods.email.currentEmail', { email: user.two_factor_email })}
                      </p>
                    )}
                  </div>
                </div>
                {!emailSetupOpen && !user.two_factor_pending_email && (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isDemo}
                    title={isDemo ? t('demo.actionBlocked') : undefined}
                    onClick={() => {
                      setEmailInput(user.two_factor_email ?? '')
                      setEmailSetupOpen(true)
                    }}
                    className="shrink-0 px-3 py-1.5 text-xs"
                  >
                    {user.two_factor_email
                      ? t('settings.security.twoFactor.methods.email.changeEmail')
                      : t('settings.security.twoFactor.methods.email.startSetup')}
                  </Button>
                )}
              </div>

              {!isDemo && (emailSetupOpen || user.two_factor_pending_email) && !user.two_factor_pending_email && (
                <form
                  className="flex flex-col gap-2 sm:flex-row sm:items-end"
                  onSubmit={(e) => {
                    e.preventDefault()
                    setupTwoFactorEmail.mutate(
                      { email: emailInput },
                      { onSuccess: () => setEmailSetupOpen(false) },
                    )
                  }}
                >
                  <Input
                    label={t('settings.security.twoFactor.emailSetup.inputLabel')}
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    className="sm:max-w-xs"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={setupTwoFactorEmail.isPending} className="px-3 py-1.5 text-xs">
                      {t('settings.security.twoFactor.emailSetup.sendCodeButton')}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setEmailSetupOpen(false)} className="px-3 py-1.5 text-xs">
                      {t('common.cancel')}
                    </Button>
                  </div>
                </form>
              )}

              {!isDemo && user.two_factor_pending_email && (
                <form
                  className="flex flex-col gap-2 sm:flex-row sm:items-end"
                  onSubmit={(e) => {
                    e.preventDefault()
                    confirmTwoFactorEmail.mutate(
                      { code: otpInput },
                      { onSuccess: () => { setEmailSetupOpen(false); setOtpInput('') } },
                    )
                  }}
                >
                  <Input
                    label={t('settings.security.twoFactor.emailSetup.codeLabel', { email: user.two_factor_pending_email })}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    className="sm:max-w-40"
                  />
                  <Button type="submit" disabled={confirmTwoFactorEmail.isPending || otpInput.length !== 6} className="px-3 py-1.5 text-xs">
                    {t('settings.security.twoFactor.emailSetup.confirmButton')}
                  </Button>
                </form>
              )}
            </div>

            {/* SMS yöntemi (pasif) */}
            <div className="flex items-start justify-between gap-4 py-3">
              <div className="flex items-start gap-3">
                <MessageSquare size={18} className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {t('settings.security.twoFactor.methods.sms.title')}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {t('settings.security.twoFactor.methods.sms.description')}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge color="slate">{t('settings.security.twoFactor.comingSoon')}</Badge>
                <Button type="button" variant="secondary" disabled className="px-3 py-1.5 text-xs">
                  {t('settings.security.twoFactor.methods.sms.startSetup')}
                </Button>
              </div>
            </div>

            {/* Authenticator yöntemi (pasif) */}
            <div className="flex items-start justify-between gap-4 py-3 last:pb-0">
              <div className="flex items-start gap-3">
                <KeyRound size={18} className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {t('settings.security.twoFactor.methods.authenticator.title')}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {t('settings.security.twoFactor.methods.authenticator.description')}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge color="slate">{t('settings.security.twoFactor.comingSoon')}</Badge>
                <Button type="button" variant="secondary" disabled className="px-3 py-1.5 text-xs">
                  {t('settings.security.twoFactor.methods.authenticator.startSetup')}
                </Button>
              </div>
            </div>
          </div>
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
                disabled={isDemo}
                required
              />
            )}

            <Input
              label={t('settings.security.newPassword')}
              type="password"
              placeholder="••••••••"
              value={passwordForm.new_password}
              onChange={(e) => handlePasswordChange('new_password', e.target.value)}
              disabled={isDemo}
              required
            />

            <Input
              label={t('settings.security.confirmPassword')}
              type="password"
              placeholder="••••••••"
              value={passwordForm.confirm_password}
              onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
              disabled={isDemo}
              required
            />

            {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}
          </div>

          <Button type="submit" disabled={changePassword.isPending || isDemo} className="w-fit" title={isDemo ? t('demo.actionBlocked') : undefined}>
            {changePassword.isPending ? t('common.loading') : t('settings.security.changePassword')}
          </Button>
        </form>
      </Card>

      {!isDemo ? (
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
                className="border border-red-500 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-500 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                {t('settings.security.revokeAllDevices')}
              </Button>
            ) : undefined
          }
        >
          {isSessionsLoading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>
          ) : sessions && sessions.length > 0 ? (
            <div className="flex flex-col gap-2">
              {sessions.map((session) => {
                const device = getDeviceInfo(session)
                const DeviceIcon = device.isMobile ? Smartphone : Laptop
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-3 dark:border-slate-700"
                  >
                    <div className="flex items-start gap-3">
                      <DeviceIcon size={18} className="mt-0.5 shrink-0 text-slate-500 dark:text-slate-400" />
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{device.label}</span>
                          {session.is_current && <Badge color="green">{t('settings.security.thisBrowser')}</Badge>}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{session.ip_address || 'IP unknown'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {session.is_current
                            ? t('settings.security.thisBrowser')
                            : `${t('settings.security.lastUsed')}: ${formatDateVerbal(session.last_used_at, { month: 'long', includeTime: true })}`}
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
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.security.noSessions')}</p>
          )}
        </Card>
      ) : (
        <Card className="rounded-xl border-gray-100 shadow-sm lg:col-span-2" icon={<Monitor size={18} />} title={t('settings.security.sessions')}>
          <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {t('settings.security.demoSessionsMessage')}
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
