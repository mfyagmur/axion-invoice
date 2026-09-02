import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { GoogleLoginButton } from '@/features/auth/components/GoogleLoginButton'
import { getLoginErrorKey } from '@/features/auth/getAuthErrorKey'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { useResendTwoFactorOtp } from '@/features/auth/hooks/useResendTwoFactorOtp'
import { useVerifyTwoFactor } from '@/features/auth/hooks/useVerifyTwoFactor'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/loginSchema'

// Backend sabitleriyle eşleşir: OTP_EXPIRE_MINUTES=3, OTP_RESEND_COOLDOWN_SECONDS=30
const OTP_EXPIRE_SECONDS = 180
const RESEND_COOLDOWN_SECONDS = 30
const ERROR_MESSAGE_VISIBLE_MS = 7000

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function LoginForm() {
  const { t } = useTranslation()
  const login = useLogin()
  const verifyTwoFactor = useVerifyTwoFactor()
  const resendTwoFactorOtp = useResendTwoFactorOtp()
  const [code, setCode] = useState('')
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [prevWrongCodeError, setPrevWrongCodeError] = useState(false)
  const [wrongCodeVisible, setWrongCodeVisible] = useState(false)
  const [prevIsExpired, setPrevIsExpired] = useState(false)
  const [expiredMessageVisible, setExpiredMessageVisible] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const session = resendTwoFactorOtp.data?.two_factor_token ? resendTwoFactorOtp.data : login.data
  const otpExpiresAt = session?.two_factor_otp_expires_at
  // Tekrar-gönder butonu, kod süresinin ilk 30 saniyesi boyunca (cooldown penceresinde) pasif kalır
  const resendCooldown = Math.max(remainingSeconds - (OTP_EXPIRE_SECONDS - RESEND_COOLDOWN_SECONDS), 0)

  // Kod süresini saniyede bir günceller
  useEffect(() => {
    if (!otpExpiresAt) return

    const tick = () => {
      const secondsLeft = Math.max(Math.round((new Date(otpExpiresAt).getTime() - Date.now()) / 1000), 0)
      setRemainingSeconds(secondsLeft)
    }
    const interval = setInterval(tick, 1000)
    tick()
    return () => clearInterval(interval)
  }, [otpExpiresAt])

  const isServerExpiredError = axios.isAxiosError(verifyTwoFactor.error) && verifyTwoFactor.error.response?.status === 400
  const isExpired = remainingSeconds <= 0 || (verifyTwoFactor.isError && isServerExpiredError)
  const wrongCodeError = verifyTwoFactor.isError && !isServerExpiredError

  // Yanlış kod / süre doldu mesajları belirli bir süre görünüp otomatik kaybolur.
  // Koşul değiştiğinde görünürlük render sırasında senkronize edilir (bkz. React
  // "you might not need an effect" - render sırasında state ayarlama deseni);
  // gizleme zamanlayıcısı ise bir effect içinde, yalnızca setTimeout callback'inde çalışır.
  if (wrongCodeError !== prevWrongCodeError) {
    setPrevWrongCodeError(wrongCodeError)
    setWrongCodeVisible(wrongCodeError)
  }
  if (isExpired !== prevIsExpired) {
    setPrevIsExpired(isExpired)
    setExpiredMessageVisible(isExpired)
  }

  useEffect(() => {
    if (!wrongCodeVisible) return
    const timer = setTimeout(() => setWrongCodeVisible(false), ERROR_MESSAGE_VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [wrongCodeVisible])

  useEffect(() => {
    if (!expiredMessageVisible) return
    const timer = setTimeout(() => setExpiredMessageVisible(false), ERROR_MESSAGE_VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [expiredMessageVisible])

  if (login.data?.requires_2fa && login.data.two_factor_token && session?.two_factor_token) {
    return (
      <form
        className="flex w-full max-w-sm flex-col gap-4 p-6 sm:p-8 md:p-10"
        onSubmit={(e) => {
          e.preventDefault()
          if (isExpired) return
          verifyTwoFactor.mutate({ two_factor_token: session.two_factor_token!, code })
        }}
      >
        <div>
          <h1 className="text-2xl font-semibold text-[#111827] dark:text-white">{t('auth.login.twoFactor.title')}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('auth.login.twoFactor.subtitle', { email: session.two_factor_email_hint })}
          </p>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="login-otp-code" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('auth.login.twoFactor.codeLabel')}
            </label>
            <span
              className={`text-xs font-medium tabular-nums ${
                isExpired ? 'text-red-600' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {t('auth.login.twoFactor.timeRemaining', { time: formatDuration(remainingSeconds) })}
            </span>
          </div>
          <Input
            id="login-otp-code"
            label={t('auth.login.twoFactor.codeLabel')}
            hideLabel
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            disabled={isExpired}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="border-slate-300 bg-white text-center text-lg tracking-[0.4em] focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-blue-900/40"
          />
        </div>

        {isExpired && expiredMessageVisible && (
          <p className="text-sm text-red-600">{t('auth.login.twoFactor.errorExpired')}</p>
        )}
        {!isExpired && wrongCodeError && wrongCodeVisible && (
          <p className="text-sm text-red-600">{t('auth.login.twoFactor.errorInvalidCode')}</p>
        )}

        <Button
          type="submit"
          disabled={verifyTwoFactor.isPending || code.length !== 6 || isExpired}
          className="w-full bg-[#111827] hover:bg-[#1f2937]"
        >
          {t('auth.login.twoFactor.submit')}
        </Button>

        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            className="font-medium text-slate-500 hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-400 dark:hover:text-white"
            onClick={() => {
              setCode('')
              resendTwoFactorOtp.mutate({ two_factor_token: session.two_factor_token! })
            }}
            disabled={resendTwoFactorOtp.isPending || resendCooldown > 0}
          >
            {resendCooldown > 0
              ? t('auth.login.twoFactor.resendCooldown', { seconds: resendCooldown })
              : t('auth.login.twoFactor.resend')}
          </button>
          <button
            type="button"
            className="font-medium text-slate-500 hover:text-[#111827] dark:text-slate-400 dark:hover:text-white"
            onClick={() => {
              login.reset()
              setCode('')
            }}
          >
            {t('auth.login.twoFactor.back')}
          </button>
        </div>
      </form>
    )
  }

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-4 p-6 sm:p-8 md:p-10"
      onSubmit={handleSubmit((values) => login.mutate(values))}
    >
      <div>
        <h1 className="text-2xl font-semibold text-[#111827] dark:text-white">{t('auth.login.title')}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">{t('auth.login.subtitle')}</p>
      </div>

      <Input
        id="login-email"
        label={t('auth.login.email')}
        type="email"
        autoComplete="email"
        error={errors.email && t(errors.email.message ?? '')}
        className="border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-blue-900/40"
        {...register('email')}
      />
      <Input
        id="login-password"
        label={t('auth.login.password')}
        type="password"
        autoComplete="current-password"
        error={errors.password && t(errors.password.message ?? '')}
        className="border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-blue-900/40"
        {...register('password')}
      />

      <Link
        to="/forgot-password"
        className="self-end text-xs font-medium text-slate-500 hover:text-[#111827] dark:text-slate-400 dark:hover:text-white"
      >
        {t('auth.login.forgotPassword')}
      </Link>

      {login.isError && <p className="text-sm text-red-600">{t(getLoginErrorKey(login.error))}</p>}

      <Button type="submit" disabled={login.isPending} className="w-full bg-[#111827] hover:bg-[#1f2937]">
        {t('auth.login.submit')}
      </Button>

      <GoogleLoginButton accountType="bireysel" />
    </form>
  )
}
