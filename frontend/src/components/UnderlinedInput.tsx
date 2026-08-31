import { forwardRef, type InputHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

interface UnderlinedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon: LucideIcon
  error?: string
  prefix?: string
}

export const UnderlinedInput = forwardRef<HTMLInputElement, UnderlinedInputProps>(function UnderlinedInput(
  { label, icon: Icon, error, className, id, prefix, ...props },
  ref,
) {
  const inputId = id ?? props.name
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <div
        className={twMerge(
          'flex items-center gap-2 border-b border-slate-300 py-1.5 transition-colors focus-within:border-slate-900 dark:border-slate-600 dark:focus-within:border-slate-300',
          error && 'border-red-500 dark:border-red-500',
        )}
      >
        <Icon size={15} className="shrink-0 text-slate-400 dark:text-slate-500" />
        {prefix && <span className="shrink-0 text-sm text-slate-400 dark:text-slate-500">{prefix}</span>}
        <input
          id={inputId}
          ref={ref}
          className={twMerge(
            'w-full border-none bg-transparent p-0 text-sm text-slate-900 outline-none focus:ring-0 dark:text-slate-100',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
})
