import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">{t('notFound.title')}</h1>
      <p className="text-slate-600">{t('notFound.body')}</p>
      <Link to="/">
        <Button>{t('notFound.backHome')}</Button>
      </Link>
    </div>
  )
}
