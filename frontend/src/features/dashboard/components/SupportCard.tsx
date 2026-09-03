import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, HelpCircle, Info } from 'lucide-react'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { env } from '@/config/env'

export function SupportCard() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const links = [
    { label: t('dashboard.demo.support.howItWorks'), icon: HelpCircle, onClick: () => navigate('/dashboard/nasil-calisir') },
    { label: t('dashboard.demo.support.whatIsHow'), icon: Info, onClick: () => navigate('/dashboard/ne-nedir-nasil') },
  ]

  return (
    <Card title={t('dashboard.demo.support.title')} className="flex h-full flex-col">
      <div className="flex flex-1 flex-col divide-y divide-slate-100 dark:divide-slate-800">
        {links.map((link) => (
          <button
            key={link.label}
            onClick={link.onClick}
            className="flex cursor-pointer items-center gap-3 py-3 text-left text-sm font-medium text-slate-700 first:pt-0 last:pb-0 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
          >
            <link.icon size={18} className="text-indigo-500 dark:text-indigo-400" />
            {link.label}
            <ChevronRight size={16} className="ml-auto text-slate-300 dark:text-slate-600" />
          </button>
        ))}
      </div>

      <a href={`mailto:${env.supportEmail}`} className="mt-4">
        <Button variant="secondary" className="w-full cursor-pointer px-3 py-1.5 text-xs">
          {t('dashboard.demo.support.contact')}
        </Button>
      </a>
    </Card>
  )
}
