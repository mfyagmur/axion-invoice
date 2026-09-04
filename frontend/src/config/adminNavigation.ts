import { LayoutDashboard, LayoutTemplate, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface AdminNavItem {
  labelKey: string
  path: string
  icon: LucideIcon
  end?: boolean
}

export const adminNavItems: AdminNavItem[] = [
  { labelKey: 'admin.nav.dashboard', path: '/admin', icon: LayoutDashboard, end: true },
  { labelKey: 'admin.nav.panel', path: '/admin/panel', icon: ShieldCheck },
  { labelKey: 'admin.nav.templates', path: '/dashboard/admin/templates', icon: LayoutTemplate },
]
