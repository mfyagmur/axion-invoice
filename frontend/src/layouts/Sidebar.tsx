import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import { dashboardNavItems } from '@/config/navigation'

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { t } = useTranslation()

  return (
    <nav className="flex h-full w-60 flex-col gap-1 border-r border-slate-200 bg-white p-4">
      <span className="mb-2 px-2 text-lg font-semibold text-slate-900">{t('common.appName')}</span>
      {dashboardNavItems.map(({ labelKey, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/dashboard'}
          onClick={onNavigate}
          className={({ isActive }) =>
            twMerge(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100',
              isActive && 'bg-slate-900 text-white hover:bg-slate-900',
            )
          }
        >
          <Icon size={18} />
          {t(labelKey)}
        </NavLink>
      ))}
    </nav>
  )
}
