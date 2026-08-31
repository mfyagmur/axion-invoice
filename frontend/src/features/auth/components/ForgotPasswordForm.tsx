import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, MailCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { getForgotPasswordErrorKey } from '@/features/auth/getAuthErrorKey'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/features/auth/schemas/forgotPasswordSchema'
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword'

export function ForgotPasswordForm() {
  const { t } = useTranslation()
  const forgotPassword = useForgotPassword()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) })

  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-2xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/60">
      <form
        className="flex w-full flex-col gap-4 p-6 sm:p-8 md:p-10"
        onSubmit={handleSubmit((values) => forgotPassword.mutate(values))}
      >
        <div>
          <h1 className="text-2xl font-semibold text-[#111827] dark:text-white">{t('auth.forgotPassword.title')}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('auth.forgotPassword.subtitle')}</p>
        </div>

        {forgotPassword.isSuccess ? (
          <div className="flex items-start gap-3 rounded-2xl bg-green-50 p-4 dark:bg-green-950/30">
            <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-700 dark:text-green-400" />
            <div>
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                {t('auth.forgotPassword.successTitle')}
              </p>
              <p className="text-sm text-green-700 dark:text-green-400">{t('auth.forgotPassword.successMessage')}</p>
            </div>
          </div>
        ) : (
          <>
            <Input
              id="forgot-password-email"
              label={t('auth.forgotPassword.email')}
              type="email"
              autoComplete="email"
              error={errors.email && t(errors.email.message ?? '')}
              className="border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/60 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-blue-900/40"
              {...register('email')}
            />

            {forgotPassword.isError && (
              <p className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {t(getForgotPasswordErrorKey())}
              </p>
            )}

            <Button type="submit" disabled={forgotPassword.isPending} className="w-full bg-[#111827] hover:bg-[#1f2937]">
              {t('auth.forgotPassword.submit')}
            </Button>
          </>
        )}

        <Link to="/login" className="text-center text-xs font-medium text-slate-500 hover:text-[#111827] dark:text-slate-400 dark:hover:text-white">
          {t('auth.forgotPassword.backToLogin')}
        </Link>
      </form>
    </div>
  )
}
