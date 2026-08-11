import { useTranslation } from 'react-i18next'
import { Card } from '@/components/Card'

interface AdditionalDetailsGridProps {
  notes: string | null
}

export function AdditionalDetailsGrid({ notes }: AdditionalDetailsGridProps) {
  const { t } = useTranslation()

  if (!notes) {
    return null
  }

  return (
    <Card title={t('invoices.form.notes')}>
      <div className="grid grid-cols-1 gap-4">
        <p className="whitespace-pre-wrap text-sm text-slate-600">{notes}</p>
      </div>
    </Card>
  )
}
