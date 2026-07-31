import { LayoutTemplate, SlidersHorizontal, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function Features() {
  const { t } = useTranslation()

  const items = [
    { icon: SlidersHorizontal, titleKey: 'landing.features.customFieldTitle', bodyKey: 'landing.features.customFieldBody' },
    { icon: LayoutTemplate, titleKey: 'landing.features.designTitle', bodyKey: 'landing.features.designBody' },
    { icon: Users, titleKey: 'landing.features.multiUserTitle', bodyKey: 'landing.features.multiUserBody' },
  ]

  return (
    <section id="features" className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="text-center text-2xl font-semibold text-slate-900">{t('landing.features.title')}</h2>
      <div className="mt-10 grid gap-8 sm:grid-cols-3">
        {items.map(({ icon: Icon, titleKey, bodyKey }) => (
          <div key={titleKey} className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-slate-100 p-3">
              <Icon size={22} className="text-slate-700" />
            </div>
            <h3 className="font-medium text-slate-900">{t(titleKey)}</h3>
            <p className="text-sm text-slate-600">{t(bodyKey)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
