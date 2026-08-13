import { twMerge } from 'tailwind-merge'
import { useLocaleStore } from '@/store/localeStore'
import type { Locale } from '@/types/auth'

const LOCALES: { value: Locale; flag: string }[] = [
  { value: 'tr', flag: 'fi-tr' },
  { value: 'en', flag: 'fi-gb' },
]

interface LanguageSwitcherProps {
  compact?: boolean
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocaleStore()

  return (
    <div
      className={twMerge(
        'flex items-center gap-1 rounded-md border border-slate-300 p-0.5 text-xs font-medium',
        compact && 'border-none p-0',
      )}
    >
      {LOCALES.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLocale(option.value)}
          aria-label={option.value}
          className={twMerge(
            'flex items-center gap-1.5 rounded px-2 py-1 uppercase text-slate-600',
            option.value === locale && 'bg-slate-900 text-white',
          )}
        >
          <span className={twMerge('fi', option.flag, 'rounded-sm')} />
          {option.value}
        </button>
      ))}
    </div>
  )
}
