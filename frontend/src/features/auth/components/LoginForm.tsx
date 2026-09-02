import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { GoogleLoginButton } from '@/features/auth/components/GoogleLoginButton'
import { getLoginErrorKey } from '@/features/auth/getAuthErrorKey'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { useResendTwoFactorOtp } from '@/features/auth/hooks/useResendTwoFactorOtp'
import { useVerifyTwoFactor } from '@/features/auth/hooks/useVerifyTwoFactor'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/loginSchema'

export function LoginForm() {
  const { t } = useTranslation()
  const login = useLogin()
  const verifyTwoFactor = useVerifyTwoFactor()
  const resendTwoFactorOtp = useResendTwoFactorOtp()
  const [code, setCode] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  if (login.data?.requires_2fa && login.data.two_factor_token) {
    const session = resendTwoFactorOtp.data?.two_factor_token
      ? resendTwoFactorOtp.data
      : login.data

    return (
      <form
        className="flex w-full max-w-sm flex-col gap-4 p-6 sm:p-8 md:p-10"
        onSubmit={(e) => {
          e.preventDefault()
          verifyTwoFactor.mutate({ two_factor_token: session.two_factor_token!, code })
        }}
      >
        <div>
          <h1 className="text-2xl font-semibold text-[#111827] dark:text-white">{t('auth.login.twoFactor.title')}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('auth.login.twoFactor.subtitle', { email: session.two_factor_email_hint })}
          </p>
        </div>

        <Input
          id="login-otp-code"
          label={t('auth.login.twoFactor.codeLabel')}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="border-slate-300 bg-white text-center text-lg tracking-[0.4em] focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-blue-900/40"
        />

        {verifyTwoFactor.isError && (
          <p className="text-sm text-red-600">{t('auth.login.twoFactor.errorInvalidCode')}</p>
        )}

        <Button type="submit" disabled={verifyTwoFactor.isPending || code.length !== 6} className="w-full bg-[#111827] hover:bg-[#1f2937]">
          {t('auth.login.twoFactor.submit')}
        </Button>

        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            className="font-medium text-slate-500 hover:text-[#111827] dark:text-slate-400 dark:hover:text-white"
            onClick={() => resendTwoFactorOtp.mutate({ two_factor_token: session.two_factor_token! })}
            disabled={resendTwoFactorOtp.isPending}
          >
            {t('auth.login.twoFactor.resend')}
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
