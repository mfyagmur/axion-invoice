import { CheckCircle2, FileText, Sparkles, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/Card'

export function HowItWorksHero() {
  const { t } = useTranslation()

  const steps = [
    { icon: CheckCircle2, title: t('howItWorks.quickStart.steps.profile.title'), body: t('howItWorks.quickStart.steps.profile.body') },
    { icon: Users, title: t('howItWorks.quickStart.steps.customer.title'), body: t('howItWorks.quickStart.steps.customer.body') },
    { icon: FileText, title: t('howItWorks.quickStart.steps.invoice.title'), body: t('howItWorks.quickStart.steps.invoice.body') },
  ]

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-white p-6 dark:border-slate-700 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
          <Sparkles size={13} />
          {t('howItWorks.hero.eyebrow')}
        </span>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100 sm:text-3xl">{t('howItWorks.hero.title')}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">{t('howItWorks.hero.subtitle')}</p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{t('howItWorks.quickStart.title')}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                  {index + 1}
                </div>
                <step.icon size={16} className="text-indigo-500 dark:text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{step.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">{step.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
