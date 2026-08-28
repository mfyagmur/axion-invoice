import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
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
      className="flex w-full max-w-sm flex-col gap-4 p-6 sm:p-8 md:p-10"
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
        <h1 className="text-2xl font-semibold text-[#111827] dark:text-white">{t('auth.signup.title')}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">{t('auth.signup.subtitle')}</p>
      </div>

      <div className="flex gap-2">
        <label className="flex-1">
          <input type="radio" value="bireysel" className="peer sr-only" {...register('account_type')} />
          <span className="block cursor-pointer rounded-md border-2 border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 peer-checked:border-[#111827] peer-checked:bg-[#111827] peer-checked:text-white peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-slate-400 peer-focus-visible:ring-offset-2">
            {t('auth.signup.accountTypeBireysel')}
          </span>
        </label>
        <label className="flex-1">
          <input type="radio" value="kurumsal" className="peer sr-only" {...register('account_type')} />
          <span className="block cursor-pointer rounded-md border-2 border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 peer-checked:border-[#111827] peer-checked:bg-[#111827] peer-checked:text-white peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-slate-400 peer-focus-visible:ring-offset-2">
            {t('auth.signup.accountTypeKurumsal')}
          </span>
        </label>
      </div>

      <Input
        id="signup-full_name"
        label={t('auth.signup.fullName')}
        autoComplete="name"
        error={errors.full_name && t(errors.full_name.message ?? '')}
        className="border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-blue-900/40"
        {...register('full_name')}
      />

      {accountType === 'kurumsal' && (
        <Input
          id="signup-company_name"
          label={t('auth.signup.companyName')}
          error={errors.company_name && t(errors.company_name.message ?? '')}
          className="border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-blue-900/40"
          {...register('company_name')}
        />
      )}

      <Input
        id="signup-email"
        label={t('auth.signup.email')}
        type="email"
        autoComplete="email"
        error={errors.email && t(errors.email.message ?? '')}
        className="border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-blue-900/40"
        {...register('email')}
      />
      <Input
        id="signup-password"
        label={t('auth.signup.password')}
        type="password"
        autoComplete="new-password"
        error={errors.password && t(errors.password.message ?? '')}
        className="border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-blue-900/40"
        {...register('password')}
      />
      <Input
        id="signup-confirmPassword"
        label={t('auth.signup.confirmPassword')}
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword && t(errors.confirmPassword.message ?? '')}
        className="border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-blue-900/40"
        {...register('confirmPassword')}
      />

      {signup.isError && (
        <p className="text-sm text-red-600">{t(getSignupErrorKey(signup.error))}</p>
      )}

      <Button type="submit" disabled={signup.isPending} className="w-full bg-[#111827] hover:bg-[#1f2937]">
        {t('auth.signup.submit')}
      </Button>

      <GoogleLoginButton accountType={accountType} />
    </form>
  )
}
