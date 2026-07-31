import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { GoogleLoginButton } from '@/features/auth/components/GoogleLoginButton'
import { getSignupErrorKey } from '@/features/auth/getAuthErrorKey'
import { useSignup } from '@/features/auth/hooks/useSignup'
import { signupSchema, type SignupFormValues } from '@/features/auth/schemas/signupSchema'

export function SignupForm() {
  const { t } = useTranslation()
  const signup = useSignup()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { account_type: 'bireysel' },
  })

  const accountType = watch('account_type')

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-4"
      onSubmit={handleSubmit((values) => {
        signup.mutate({
          email: values.email,
          password: values.password,
          full_name: values.full_name,
          account_type: values.account_type,
          company_name: values.company_name,
        })
      })}
    >
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t('auth.signup.title')}</h1>
        <p className="text-sm text-slate-600">{t('auth.signup.subtitle')}</p>
      </div>

      <div className="flex gap-2">
        <label className="flex-1">
          <input type="radio" value="bireysel" className="peer sr-only" {...register('account_type')} />
          <span className="block cursor-pointer rounded-md border border-slate-300 px-3 py-2 text-center text-sm peer-checked:border-slate-900 peer-checked:bg-slate-900 peer-checked:text-white">
            {t('auth.signup.accountTypeBireysel')}
          </span>
        </label>
        <label className="flex-1">
          <input type="radio" value="kurumsal" className="peer sr-only" {...register('account_type')} />
          <span className="block cursor-pointer rounded-md border border-slate-300 px-3 py-2 text-center text-sm peer-checked:border-slate-900 peer-checked:bg-slate-900 peer-checked:text-white">
            {t('auth.signup.accountTypeKurumsal')}
          </span>
        </label>
      </div>

      <Input
        label={t('auth.signup.fullName')}
        autoComplete="name"
        error={errors.full_name && t(errors.full_name.message ?? '')}
        {...register('full_name')}
      />

      {accountType === 'kurumsal' && (
        <Input
          label={t('auth.signup.companyName')}
          error={errors.company_name && t(errors.company_name.message ?? '')}
          {...register('company_name')}
        />
      )}

      <Input
        label={t('auth.signup.email')}
        type="email"
        autoComplete="email"
        error={errors.email && t(errors.email.message ?? '')}
        {...register('email')}
      />
      <Input
        label={t('auth.signup.password')}
        type="password"
        autoComplete="new-password"
        error={errors.password && t(errors.password.message ?? '')}
        {...register('password')}
      />
      <Input
        label={t('auth.signup.confirmPassword')}
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword && t(errors.confirmPassword.message ?? '')}
        {...register('confirmPassword')}
      />

      {signup.isError && (
        <p className="text-sm text-red-600">{t(getSignupErrorKey(signup.error))}</p>
      )}

      <Button type="submit" disabled={signup.isPending}>
        {t('auth.signup.submit')}
      </Button>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        {t('auth.login.googleDivider')}
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleLoginButton accountType={accountType} />

      <p className="text-center text-sm text-slate-600">
        {t('auth.signup.hasAccount')}{' '}
        <Link to="/login" className="font-medium text-slate-900 underline">
          {t('auth.signup.loginLink')}
        </Link>
      </p>
    </form>
  )
}
