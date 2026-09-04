import { useTranslation } from 'react-i18next'

export function AdminPanelPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t('admin.panel.title')}</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin.panel.comingSoon')}</p>
    </div>
  )
}
