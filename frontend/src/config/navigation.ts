import { FileText, LayoutDashboard, LayoutTemplate, Settings, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  labelKey: string
  path: string
  icon: LucideIcon
}

export const dashboardNavItems: NavItem[] = [
  { labelKey: 'nav.dashboard', path: '/dashboard', icon: LayoutDashboard },
  { labelKey: 'nav.invoices', path: '/dashboard/invoices', icon: FileText },
  { labelKey: 'nav.templates', path: '/dashboard/templates', icon: LayoutTemplate },
  { labelKey: 'nav.customers', path: '/dashboard/customers', icon: Users },
  { labelKey: 'nav.settings', path: '/dashboard/settings', icon: Settings },
]
