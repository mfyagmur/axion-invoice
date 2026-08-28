import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router-dom'
import { Button } from '@/components/Button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useDemoLogin } from '@/features/auth/hooks/useDemoLogin'

export function AuthLayout() {
  const { t } = useTranslation()
  const demoLogin = useDemoLogin()

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-slate-900 via-slate-700 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <header className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-semibold text-white">
          {t('common.appName')}
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link to="/login" className="text-sm font-medium text-white/90 hover:text-white">
            {t('landing.nav.login')}
          </Link>
          <Button
            className="bg-[#111827] hover:bg-[#1f2937]"
            onClick={() => demoLogin.mutate()}
            disabled={demoLogin.isPending}
          >
            {t('landing.nav.signup')}
          </Button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
