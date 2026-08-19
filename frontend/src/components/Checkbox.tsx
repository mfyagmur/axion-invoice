import { InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  ariaLabel?: string
}

export function Checkbox({ ariaLabel, disabled, checked, onChange, ...props }: CheckboxProps) {
  return (
    <label
      className="flex items-center cursor-pointer"
      aria-disabled={disabled}
    >
      <input
        type="checkbox"
        checked={checked as boolean}
        onChange={onChange}
        disabled={disabled}
        data-state={checked ? 'checked' : 'unchecked'}
        aria-label={ariaLabel}
        className="w-5 h-5 appearance-none border-2 border-slate-300 rounded cursor-pointer transition-all
          data-[state=unchecked]:bg-white data-[state=unchecked]:border-slate-300
          data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        {...props}
      />
      {checked && (
        <svg
          className="w-4 h-4 text-white pointer-events-none absolute ml-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </label>
  )
}
