import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

interface CardProps {
  icon?: ReactNode
  title?: string
  subtitle?: ReactNode
  children: ReactNode
  action?: ReactNode
  className?: string
}

export function Card({ icon, title, subtitle, children, action, className }: CardProps) {
  return (
    <div className={twMerge('rounded-lg border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900', className)}>
      {(icon || title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {icon && <div className="text-slate-600 dark:text-slate-300">{icon}</div>}
            {title && (
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
                {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
              </div>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
