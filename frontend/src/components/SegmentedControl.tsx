import type { LucideIcon } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

export interface SegmentedControlOption<T extends string> {
  value: T
  label: string
  icon?: LucideIcon
}

interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: SegmentedControlOption<T>[]
  className?: string
}

export function SegmentedControl<T extends string>({ value, onChange, options, className }: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" className={twMerge('inline-flex w-full rounded-xl bg-slate-100 p-1 dark:bg-slate-800', className)}>
      {options.map((option) => {
        const active = option.value === value
        const Icon = option.icon
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={twMerge(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
              active
                ? 'bg-[#111827] text-white shadow-sm dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200',
            )}
          >
            {Icon && <Icon size={16} />}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
