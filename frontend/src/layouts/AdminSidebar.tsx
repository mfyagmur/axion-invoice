import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { adminNavItems } from '@/config/adminNavigation'
import { dashboardNavItems } from '@/config/navigation'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { useAuthStore } from '@/store/authStore'
import { useSidebarStore } from '@/store/sidebarStore'

interface AdminSidebarProps {
  onNavigate?: () => void
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()
  const { isCollapsed, toggleCollapsed } = useSidebarStore()
  const collapsed = isCollapsed && !onNavigate
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const handleLogout = () => {
    logout.mutate()
    setIsMenuOpen(false)
  }

  return (
    <nav
      className={twMerge(
        'relative flex h-full flex-col border-r border-slate-200 bg-white p-4 transition-[width] duration-300 ease-in-out dark:border-slate-700 dark:bg-slate-900',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {!onNavigate && (
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label="toggle-sidebar"
          className="absolute right-0 top-8 z-10 flex h-6 w-6 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        </button>
      )}

      <div className="mb-4 flex items-center">
        {!collapsed && (
          <span className="px-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('common.appName')} <span className="text-slate-400 dark:text-slate-500">Admin</span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {adminNavItems.map(({ label, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              twMerge(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                collapsed && 'justify-center px-0',
                isActive && 'bg-slate-900 text-white hover:bg-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-100',
              )
            }
          >
            <Icon size={18} />
            {!collapsed && label}
          </NavLink>
        ))}

        <div className="my-2 border-t border-slate-200 dark:border-slate-700" />

        {dashboardNavItems.slice(1).map(({ labelKey, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onNavigate}
            title={collapsed ? t(labelKey) : undefined}
            className={({ isActive }) =>
              twMerge(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                collapsed && 'justify-center px-0',
                isActive && 'bg-slate-900 text-white hover:bg-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-100',
              )
            }
          >
            <Icon size={18} />
            {!collapsed && t(labelKey)}
          </NavLink>
        ))}
      </div>

      {user && (
        <div className="relative mt-4 border-t border-slate-200 pt-4 dark:border-slate-700" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title={collapsed ? user.full_name : undefined}
            className={twMerge(
              'flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800',
              collapsed && 'justify-center px-0',
            )}
          >
            <div className={twMerge('flex items-center gap-2', collapsed && 'gap-0')}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-sm font-semibold dark:bg-slate-100 dark:text-slate-900">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.full_name}</span>
                </div>
              )}
            </div>
            {!collapsed &&
              (isMenuOpen ? (
                <ChevronUp size={16} className="text-slate-600 dark:text-slate-300" />
              ) : (
                <ChevronDown size={16} className="text-slate-600 dark:text-slate-300" />
              ))}
          </button>

          {isMenuOpen && (
            <div
              className={twMerge(
                'absolute bottom-full left-0 right-0 mb-2 w-60 rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900',
                collapsed && 'left-0 right-auto',
              )}
            >
              <div className="border-b border-slate-200 px-3 py-2 dark:border-slate-700">
                <p className="mb-1 text-sm font-medium text-slate-900 dark:text-slate-100">{user.full_name}</p>
                <p className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{user.email}</p>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-300">{t('common.language')}</span>
                <LanguageSwitcher compact />
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-300">{t('common.theme')}</span>
                <ThemeSwitcher compact />
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <HelpCircle size={16} />
                  {t('nav.support') || 'Support'}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="border-t border-slate-200 flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                >
                  <LogOut size={16} />
                  {t('nav.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
