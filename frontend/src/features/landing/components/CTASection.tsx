import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { useDemoLogin } from '@/features/auth/hooks/useDemoLogin'

export function CTASection() {
  const { t } = useTranslation()
  const demoLogin = useDemoLogin()

  return (
    <section className="bg-slate-900 px-6 py-16 text-center">
      <h2 className="text-2xl font-semibold text-white">{t('landing.cta.title')}</h2>
      <p className="mt-2 text-slate-300">{t('landing.cta.subtitle')}</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/signup">
          <Button variant="secondary">{t('landing.cta.button')}</Button>
        </Link>
        <Button variant="ghost" className="text-white" onClick={() => demoLogin.mutate()} disabled={demoLogin.isPending}>
          {t('landing.cta.demoButton')}
        </Button>
      </div>
    </section>
  )
}
