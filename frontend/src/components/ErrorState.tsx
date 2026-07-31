import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'

interface ErrorStateProps {
  onRetry: () => void
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3">
      <p className="text-sm text-red-700">{t('common.genericError')}</p>
      <Button variant="secondary" onClick={onRetry}>
        {t('common.retry')}
      </Button>
    </div>
  )
}
