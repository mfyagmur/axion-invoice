import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router-dom'
import { Button } from '@/components/Button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function PublicLayout() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <Link to="/" className="text-lg font-semibold text-slate-900">
          {t('common.appName')}
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900">
            {t('landing.nav.login')}
          </Link>
          <Link to="/signup">
            <Button>{t('landing.nav.signup')}</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {t('common.appName')} — {t('landing.footer.rights')}
      </footer>
    </div>
  )
}
