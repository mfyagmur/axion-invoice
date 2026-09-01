import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'

export function CTASection() {
  const { t } = useTranslation()

  return (
    <section className="bg-slate-900 px-6 py-16 text-center">
      <h2 className="text-2xl font-semibold text-white">{t('landing.cta.title')}</h2>
      <p className="mt-2 text-slate-300">{t('landing.cta.subtitle')}</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/signup">
          <Button variant="secondary">{t('landing.cta.button')}</Button>
        </Link>
        <Link to="/get-started">
          <Button variant="ghost" className="text-white">
            {t('landing.cta.demoButton')}
          </Button>
        </Link>
      </div>
    </section>
  )
}
