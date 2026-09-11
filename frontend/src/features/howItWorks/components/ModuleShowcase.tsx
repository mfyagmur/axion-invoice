import { FileText, LayoutDashboard, LayoutTemplate, Settings, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ModuleCard } from './ModuleCard'
import { CustomersMockup, DashboardMockup, InvoicesMockup, SettingsMockup, TemplatesMockup } from './moduleMockups'

export function ModuleShowcase() {
  const { t } = useTranslation()

  const modules = [
    {
      key: 'dashboard',
      icon: LayoutDashboard,
      title: t('howItWorks.modules.dashboard.title'),
      description: t('howItWorks.modules.dashboard.description'),
      bullets: [
        t('howItWorks.modules.dashboard.bullets.kpi'),
        t('howItWorks.modules.dashboard.bullets.charts'),
        t('howItWorks.modules.dashboard.bullets.tables'),
      ],
      mockup: <DashboardMockup />,
    },
    {
      key: 'invoices',
      icon: FileText,
      title: t('howItWorks.modules.invoices.title'),
      description: t('howItWorks.modules.invoices.description'),
      bullets: [
        t('howItWorks.modules.invoices.bullets.lifecycle'),
        t('howItWorks.modules.invoices.bullets.pdf'),
        t('howItWorks.modules.invoices.bullets.email'),
        t('howItWorks.modules.invoices.bullets.reminders'),
        t('howItWorks.modules.invoices.bullets.currency'),
      ],
      mockup: <InvoicesMockup />,
    },
    {
      key: 'templates',
      icon: LayoutTemplate,
      title: t('howItWorks.modules.templates.title'),
      description: t('howItWorks.modules.templates.description'),
      bullets: [
        t('howItWorks.modules.templates.bullets.dragDrop'),
        t('howItWorks.modules.templates.bullets.systemTemplates'),
        t('howItWorks.modules.templates.bullets.planLimit'),
      ],
      mockup: <TemplatesMockup />,
    },
    {
      key: 'customers',
      icon: Users,
      title: t('howItWorks.modules.customers.title'),
      description: t('howItWorks.modules.customers.description'),
      bullets: [
        t('howItWorks.modules.customers.bullets.type'),
        t('howItWorks.modules.customers.bullets.contacts'),
        t('howItWorks.modules.customers.bullets.detail'),
      ],
      mockup: <CustomersMockup />,
    },
    {
      key: 'settings',
      icon: Settings,
      title: t('howItWorks.modules.settings.title'),
      description: t('howItWorks.modules.settings.description'),
      bullets: [
        t('howItWorks.modules.settings.bullets.tabs'),
        t('howItWorks.modules.settings.bullets.definitions'),
        t('howItWorks.modules.settings.bullets.security'),
      ],
      mockup: <SettingsMockup />,
    },
  ]

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('howItWorks.modules.title')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('howItWorks.modules.subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <ModuleCard
            key={module.key}
            icon={module.icon}
            title={module.title}
            description={module.description}
            bullets={module.bullets}
            mockup={module.mockup}
          />
        ))}
      </div>
    </section>
  )
}
