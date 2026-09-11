import { useTranslation } from 'react-i18next'
import { Card } from '@/components/Card'

export function StepGuide() {
  const { t } = useTranslation()

  const steps = [
    { title: t('howItWorks.stepGuide.steps.customer.title'), body: t('howItWorks.stepGuide.steps.customer.body') },
    { title: t('howItWorks.stepGuide.steps.template.title'), body: t('howItWorks.stepGuide.steps.template.body') },
    { title: t('howItWorks.stepGuide.steps.items.title'), body: t('howItWorks.stepGuide.steps.items.body') },
    { title: t('howItWorks.stepGuide.steps.preview.title'), body: t('howItWorks.stepGuide.steps.preview.body') },
    { title: t('howItWorks.stepGuide.steps.send.title'), body: t('howItWorks.stepGuide.steps.send.body') },
  ]

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('howItWorks.stepGuide.title')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('howItWorks.stepGuide.subtitle')}</p>
      </div>
      <Card>
        <ol className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
          {steps.map((step) => (
            <li key={step.title} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0">
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{step.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">{step.body}</p>
            </li>
          ))}
        </ol>
      </Card>
    </section>
  )
}
