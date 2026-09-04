import { LayoutDashboard, LayoutTemplate, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface AdminNavItem {
  label: string
  path: string
  icon: LucideIcon
  end?: boolean
}

export const adminNavItems: AdminNavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Admin Panel', path: '/admin/panel', icon: ShieldCheck },
  { label: 'Şablon Yönetimi', path: '/dashboard/admin/templates', icon: LayoutTemplate },
]
