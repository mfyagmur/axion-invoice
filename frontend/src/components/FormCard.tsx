import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

interface FormCardProps {
  icon: LucideIcon
  title: string
  children: ReactNode
  className?: string
}

export function FormCard({ icon: Icon, title, children, className }: FormCardProps) {
  return (
    <div className={twMerge('flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800/60', className)}>
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-700/50">
        <Icon size={18} className="text-slate-500 dark:text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}
