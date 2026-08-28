import { Monitor, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { useThemeStore, type ThemeMode } from '@/store/themeStore'

const THEME_OPTIONS: { value: ThemeMode; icon: typeof Sun; labelKey: string }[] = [
  { value: 'light', icon: Sun, labelKey: 'common.themeLight' },
  { value: 'dark', icon: Moon, labelKey: 'common.themeDark' },
  { value: 'system', icon: Monitor, labelKey: 'common.themeSystem' },
]

interface ThemeSwitcherProps {
  compact?: boolean
}

export function ThemeSwitcher({ compact = false }: ThemeSwitcherProps) {
  const { t } = useTranslation()
  const { mode, setMode } = useThemeStore()

  return (
    <div
      className={twMerge(
        'flex items-center gap-1 rounded-md border border-slate-300 p-0.5 text-xs font-medium dark:border-slate-600',
        compact && 'border-none p-0',
      )}
    >
      {THEME_OPTIONS.map(({ value, icon: Icon, labelKey }) => (
        <button
          key={value}
          type="button"
          onClick={() => setMode(value)}
          aria-label={t(labelKey)}
          title={t(labelKey)}
          className={twMerge(
            'flex items-center justify-center rounded px-2 py-1 text-slate-600 transition-colors duration-150 dark:text-slate-300',
            value === mode && 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
          )}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  )
}
