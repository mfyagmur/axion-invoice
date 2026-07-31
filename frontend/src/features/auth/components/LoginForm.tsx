import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { GoogleLoginButton } from '@/features/auth/components/GoogleLoginButton'
import { getLoginErrorKey } from '@/features/auth/getAuthErrorKey'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/loginSchema'

export function LoginForm() {
  const { t } = useTranslation()
  const login = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-4"
      onSubmit={handleSubmit((values) => login.mutate(values))}
    >
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t('auth.login.title')}</h1>
        <p className="text-sm text-slate-600">{t('auth.login.subtitle')}</p>
      </div>

      <Input
        label={t('auth.login.email')}
        type="email"
        autoComplete="email"
        error={errors.email && t(errors.email.message ?? '')}
        {...register('email')}
      />
      <Input
        label={t('auth.login.password')}
        type="password"
        autoComplete="current-password"
        error={errors.password && t(errors.password.message ?? '')}
        {...register('password')}
      />

      {login.isError && <p className="text-sm text-red-600">{t(getLoginErrorKey(login.error))}</p>}

      <Button type="submit" disabled={login.isPending}>
        {t('auth.login.submit')}
      </Button>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        {t('auth.login.googleDivider')}
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleLoginButton accountType="bireysel" />

      <p className="text-center text-sm text-slate-600">
        {t('auth.login.noAccount')}{' '}
        <Link to="/signup" className="font-medium text-slate-900 underline">
          {t('auth.login.signupLink')}
        </Link>
      </p>
    </form>
  )
}
