import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export interface BadgeProps {
  children: ReactNode
  color?: 'slate' | 'blue' | 'green' | 'red' | 'amber'
  className?: string
}

const colorClasses: Record<NonNullable<BadgeProps['color']>, string> = {
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  green: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300',
  red: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  amber: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
}

export function Badge({ children, color = 'slate', className }: BadgeProps) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorClasses[color],
        className,
      )}
    >
      {children}
    </span>
  )
}
