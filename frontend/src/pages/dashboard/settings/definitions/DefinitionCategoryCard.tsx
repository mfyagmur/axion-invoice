import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

export interface DefinitionMenuItem {
  key: string
  label: string
  icon: ReactNode
}

interface DefinitionCategoryCardProps {
  icon: ReactNode
  title: string
  items: DefinitionMenuItem[]
  activeKey: string | null
  onSelect: (key: string) => void
}

export function DefinitionCategoryCard({ icon, title, items, activeKey, onSelect }: DefinitionCategoryCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3 flex items-center gap-2">
        <div className="text-slate-600 dark:text-slate-300">{icon}</div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      </div>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const isActive = activeKey === item.key
          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => onSelect(item.key)}
                className={twMerge(
                  'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2.5 text-left text-sm transition-colors cursor-pointer hover:bg-green-50 dark:hover:bg-green-950/30',
                  isActive ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 'text-slate-700 dark:text-slate-300',
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}>{item.icon}</span>
                  {item.label}
                </span>
                <ChevronRight
                  size={16}
                  className={twMerge('shrink-0', isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-300 dark:text-slate-600')}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
