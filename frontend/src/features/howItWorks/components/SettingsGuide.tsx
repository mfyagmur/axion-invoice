import { CalendarDays, CreditCard, ShieldCheck, SlidersHorizontal, UserCircle, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/Card'

export function SettingsGuide() {
  const { t } = useTranslation()

  const tabs = [
    { icon: UserCircle, label: t('howItWorks.settingsGuide.tabs.profile.label'), body: t('howItWorks.settingsGuide.tabs.profile.body') },
    { icon: Wallet, label: t('howItWorks.settingsGuide.tabs.account.label'), body: t('howItWorks.settingsGuide.tabs.account.body') },
    { icon: SlidersHorizontal, label: t('howItWorks.settingsGuide.tabs.preferences.label'), body: t('howItWorks.settingsGuide.tabs.preferences.body') },
    { icon: ShieldCheck, label: t('howItWorks.settingsGuide.tabs.security.label'), body: t('howItWorks.settingsGuide.tabs.security.body') },
    { icon: CreditCard, label: t('howItWorks.settingsGuide.tabs.billing.label'), body: t('howItWorks.settingsGuide.tabs.billing.body') },
  ]

  const definitionGroups = [
    t('howItWorks.settingsGuide.tabs.definitions.groups.system'),
    t('howItWorks.settingsGuide.tabs.definitions.groups.finance'),
    t('howItWorks.settingsGuide.tabs.definitions.groups.operations'),
  ]

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('howItWorks.settingsGuide.title')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('howItWorks.settingsGuide.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {tabs.map((tab) => (
          <Card key={tab.label} className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <tab.icon size={16} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{tab.label}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">{tab.body}</p>
            </div>
          </Card>
        ))}

        <Card className="flex items-start gap-3 sm:col-span-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
            <CalendarDays size={16} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{t('howItWorks.settingsGuide.tabs.definitions.label')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{t('howItWorks.settingsGuide.tabs.definitions.body')}</p>
            <ul className="mt-2 flex flex-col gap-1">
              {definitionGroups.map((group) => (
                <li key={group} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400 dark:bg-indigo-500" />
                  {group}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </section>
  )
}
