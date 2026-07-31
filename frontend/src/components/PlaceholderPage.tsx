import { useTranslation } from 'react-i18next'

interface PlaceholderPageProps {
  titleKey: string
}

export function PlaceholderPage({ titleKey }: PlaceholderPageProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold text-slate-900">{t(titleKey)}</h1>
      <p className="text-sm text-slate-500">{t('common.comingSoon')}</p>
    </div>
  )
}
