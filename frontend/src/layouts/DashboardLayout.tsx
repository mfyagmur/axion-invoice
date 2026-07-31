import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'
import { Button } from '@/components/Button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { Sidebar } from '@/layouts/Sidebar'
import { useAuthStore } from '@/store/authStore'

export function DashboardLayout() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileNavOpen(false)} />
          <div className="relative z-50">
            <Sidebar onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setMobileNavOpen((open) => !open)}
            aria-label="menu"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="ml-auto flex items-center gap-4">
            <LanguageSwitcher />
            {user && <span className="text-sm text-slate-600">{user.full_name}</span>}
            <Button variant="ghost" onClick={() => logout.mutate()}>
              {t('nav.logout')}
            </Button>
          </div>
        </header>

        {user?.is_demo && (
          <div className="bg-amber-50 px-6 py-2 text-sm text-amber-800">{t('demo.banner')}</div>
        )}

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
