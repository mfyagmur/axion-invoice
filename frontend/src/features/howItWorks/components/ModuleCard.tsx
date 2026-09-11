import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/Card'

interface ModuleCardProps {
  icon: LucideIcon
  title: string
  description: string
  bullets: string[]
  mockup: ReactNode
}

export function ModuleCard({ icon: Icon, title, description, bullets, mockup }: ModuleCardProps) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
        {mockup}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
            <Icon size={18} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
        <ul className="mt-1 flex flex-col gap-1.5">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400 dark:bg-indigo-500" />
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
