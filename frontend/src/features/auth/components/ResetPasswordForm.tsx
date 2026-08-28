import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { getResetPasswordErrorKey } from '@/features/auth/getAuthErrorKey'
import { useResetPassword } from '@/features/auth/hooks/useResetPassword'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/features/auth/schemas/resetPasswordSchema'

export function ResetPasswordForm() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const resetPassword = useResetPassword()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) })

  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-2xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/60">
      <div className="flex w-full max-w-sm flex-col gap-4 p-6 sm:p-8 md:p-10">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827] dark:text-white">{t('auth.resetPassword.title')}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('auth.resetPassword.subtitle')}</p>
        </div>

        {!token ? (
          <p className="text-sm text-red-600">{t('auth.resetPassword.errors.invalidToken')}</p>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit((values) =>
              resetPassword.mutate({
                token,
                new_password: values.password,
                confirm_password: values.confirmPassword,
              }),
            )}
          >
            <Input
              id="reset-password-password"
              label={t('auth.resetPassword.password')}
              type="password"
              autoComplete="new-password"
              error={errors.password && t(errors.password.message ?? '')}
              className="border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-blue-900/40"
              {...register('password')}
            />
            <Input
              id="reset-password-confirmPassword"
              label={t('auth.resetPassword.confirmPassword')}
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword && t(errors.confirmPassword.message ?? '')}
              className="border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-blue-900/40"
              {...register('confirmPassword')}
            />

            {resetPassword.isError && (
              <p className="text-sm text-red-600">{t(getResetPasswordErrorKey(resetPassword.error))}</p>
            )}

            <Button type="submit" disabled={resetPassword.isPending} className="w-full bg-[#111827] hover:bg-[#1f2937]">
              {t('auth.resetPassword.submit')}
            </Button>
          </form>
        )}

        <Link to="/login" className="text-center text-xs font-medium text-slate-500 hover:text-[#111827] dark:text-slate-400 dark:hover:text-white">
          {t('auth.forgotPassword.backToLogin')}
        </Link>
      </div>
    </div>
  )
}
