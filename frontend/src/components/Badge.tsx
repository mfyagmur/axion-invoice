import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export interface BadgeProps {
  children: ReactNode
  color?: 'slate' | 'blue' | 'green' | 'red' | 'amber'
  className?: string
}

const colorClasses: Record<NonNullable<BadgeProps['color']>, string> = {
  slate: 'bg-slate-100 text-slate-700',
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  red: 'bg-red-50 text-red-700',
  amber: 'bg-amber-50 text-amber-800',
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
