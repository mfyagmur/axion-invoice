import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'
import { useIdleLogout } from '@/features/auth/hooks/useIdleLogout'
import { Sidebar } from '@/layouts/Sidebar'
import { useAuthStore } from '@/store/authStore'

export function DashboardLayout() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  useIdleLogout()

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
        <header className="flex items-center border-b border-slate-200 px-6 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen((open) => !open)}
            aria-label="menu"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
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
