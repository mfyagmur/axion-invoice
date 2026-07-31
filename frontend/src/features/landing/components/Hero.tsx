import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'

export function Hero() {
  const { t } = useTranslation()

  return (
    <section className="px-6 py-24 text-center">
      <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        {t('landing.hero.title')}
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">{t('landing.hero.subtitle')}</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/signup">
          <Button>{t('landing.hero.ctaPrimary')}</Button>
        </Link>
        <Link to="/login">
          <Button variant="secondary">{t('landing.hero.ctaSecondary')}</Button>
        </Link>
      </div>
    </section>
  )
}
