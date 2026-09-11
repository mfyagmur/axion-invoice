import { KeyRound, LogIn, PlayCircle, ShieldCheck, Undo2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/Card'

export function LoginGuide() {
  const { t } = useTranslation()

  const methods = [
    { icon: KeyRound, title: t('howItWorks.login.methods.password.title'), body: t('howItWorks.login.methods.password.body') },
    { icon: LogIn, title: t('howItWorks.login.methods.google.title'), body: t('howItWorks.login.methods.google.body') },
    { icon: PlayCircle, title: t('howItWorks.login.methods.demo.title'), body: t('howItWorks.login.methods.demo.body') },
    { icon: ShieldCheck, title: t('howItWorks.login.methods.twoFactor.title'), body: t('howItWorks.login.methods.twoFactor.body') },
    { icon: Undo2, title: t('howItWorks.login.methods.forgotPassword.title'), body: t('howItWorks.login.methods.forgotPassword.body') },
  ]

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('howItWorks.login.title')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('howItWorks.login.subtitle')}</p>
      </div>
      <Card>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          {methods.map((method) => (
            <div key={method.title} className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <method.icon size={16} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{method.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">{method.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}
