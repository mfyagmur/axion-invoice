import { Crown, Rocket, Sprout } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'

export function PlanComparisonStrip() {
  const { t } = useTranslation()

  const plans = [
    { icon: Sprout, color: 'slate' as const, title: t('howItWorks.plans.free.title'), body: t('howItWorks.plans.free.body') },
    { icon: Rocket, color: 'blue' as const, title: t('howItWorks.plans.pro.title'), body: t('howItWorks.plans.pro.body') },
    { icon: Crown, color: 'amber' as const, title: t('howItWorks.plans.business.title'), body: t('howItWorks.plans.business.body') },
  ]

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('howItWorks.plans.title')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('howItWorks.plans.subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.title} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <plan.icon size={18} className="text-slate-500 dark:text-slate-400" />
              <Badge color={plan.color}>{plan.title}</Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{plan.body}</p>
          </Card>
        ))}
      </div>
      <Link
        to="/dashboard/settings?tab=billing"
        className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
      >
        {t('howItWorks.plans.cta')}
      </Link>
    </section>
  )
}
