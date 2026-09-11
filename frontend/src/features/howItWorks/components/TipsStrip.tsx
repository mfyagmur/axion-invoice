import { HelpCircle, Languages, PanelLeftClose, SunMoon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/Card'

export function TipsStrip() {
  const { t } = useTranslation()

  const tips = [
    { icon: SunMoon, title: t('howItWorks.tips.items.theme.title'), body: t('howItWorks.tips.items.theme.body') },
    { icon: Languages, title: t('howItWorks.tips.items.language.title'), body: t('howItWorks.tips.items.language.body') },
    { icon: PanelLeftClose, title: t('howItWorks.tips.items.sidebar.title'), body: t('howItWorks.tips.items.sidebar.body') },
    { icon: HelpCircle, title: t('howItWorks.tips.items.support.title'), body: t('howItWorks.tips.items.support.body') },
  ]

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('howItWorks.tips.title')}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tips.map((tip) => (
          <Card key={tip.title} className="flex flex-col gap-2">
            <tip.icon size={18} className="text-indigo-500 dark:text-indigo-400" />
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{tip.title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{tip.body}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
