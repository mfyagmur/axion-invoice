import { useTranslation } from 'react-i18next'
import { Card } from '@/components/Card'

interface InvoicesTodayCardProps {
  data: number | undefined
  isLoading: boolean
}

export function InvoicesTodayCard({ data, isLoading }: InvoicesTodayCardProps) {
  const { t } = useTranslation()

  return (
    <Card title={t('admin.dashboard.operational.invoicesToday.title')} className="flex flex-col gap-2 p-4">
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isLoading && data !== undefined && (
        <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{data}</span>
      )}
    </Card>
  )
}
