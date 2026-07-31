import { useTranslation } from 'react-i18next'

const PLAN_KEYS = ['free', 'pro', 'business'] as const

export function Pricing() {
  const { t } = useTranslation()

  return (
    <section id="pricing" className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="text-center text-2xl font-semibold text-slate-900">{t('landing.pricing.title')}</h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {PLAN_KEYS.map((plan) => (
          <div key={plan} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900">{t(`landing.pricing.${plan}.name`)}</h3>
            <p className="text-3xl font-bold text-slate-900">
              {t(`landing.pricing.${plan}.price`)}
              <span className="text-sm font-normal text-slate-500">{t('landing.pricing.perMonth')}</span>
            </p>
            <ul className="flex flex-col gap-1 text-sm text-slate-600">
              <li>{t(`landing.pricing.${plan}.feature1`)}</li>
              <li>{t(`landing.pricing.${plan}.feature2`)}</li>
              <li>{t(`landing.pricing.${plan}.feature3`)}</li>
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
