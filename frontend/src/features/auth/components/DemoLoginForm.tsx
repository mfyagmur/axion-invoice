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

const DEMO_CREDENTIALS: LoginFormValues = {
  email: 'demo@axioninvoice.app',
  password: 'Demo.12345',
}

export function DemoLoginForm() {
  const { t } = useTranslation()
  const login = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: DEMO_CREDENTIALS,
  })

  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-2xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/60">
      <form
        className="flex w-full flex-col gap-4 p-6 sm:p-8 md:p-10"
        onSubmit={handleSubmit((values) => login.mutate(values))}
      >
        <div>
          <h1 className="text-2xl font-semibold text-[#111827] dark:text-white">{t('auth.demoLogin.title')}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('auth.demoLogin.subtitle')}</p>
        </div>

        <Input
          id="demo-login-email"
          label={t('auth.login.email')}
          type="email"
          autoComplete="email"
          error={errors.email && t(errors.email.message ?? '')}
          className="border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-blue-900/40"
          {...register('email')}
        />
        <Input
          id="demo-login-password"
          label={t('auth.login.password')}
          type="password"
          autoComplete="current-password"
          error={errors.password && t(errors.password.message ?? '')}
          className="border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-blue-900/40"
          {...register('password')}
        />

        {login.isError && <p className="text-sm text-red-600">{t(getLoginErrorKey(login.error))}</p>}

        <Button type="submit" disabled={login.isPending} className="w-full bg-[#111827] hover:bg-[#1f2937]">
          {t('auth.login.submit')}
        </Button>

        <GoogleLoginButton accountType="bireysel" />

        <Link
          to="/login"
          className="text-center text-xs font-medium text-slate-500 hover:text-[#111827] dark:text-slate-400 dark:hover:text-white"
        >
          {t('auth.demoLogin.backToLogin')}
        </Link>
      </form>
    </div>
  )
}
