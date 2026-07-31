import { twMerge } from 'tailwind-merge'
import { useLocaleStore } from '@/store/localeStore'
import type { Locale } from '@/types/auth'

const LOCALES: Locale[] = ['tr', 'en']

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocaleStore()

  return (
    <div className="flex items-center gap-1 rounded-md border border-slate-300 p-0.5 text-xs font-medium">
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          className={twMerge(
            'rounded px-2 py-1 uppercase text-slate-600',
            option === locale && 'bg-slate-900 text-white',
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
