export function DashboardMockup() {
  return (
    <div className="flex h-24 gap-2">
      <div className="grid flex-1 grid-cols-2 gap-1.5">
        {['bg-indigo-200 dark:bg-indigo-900/50', 'bg-green-200 dark:bg-green-900/50', 'bg-amber-200 dark:bg-amber-900/50', 'bg-slate-200 dark:bg-slate-700'].map((color, i) => (
          <div key={i} className={`rounded ${color}`} />
        ))}
      </div>
      <div className="flex h-full w-16 shrink-0 items-center justify-center rounded bg-slate-100 dark:bg-slate-800">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-300 border-t-indigo-500 dark:border-indigo-800 dark:border-t-indigo-400" />
      </div>
    </div>
  )
}

export function InvoicesMockup() {
  const rows: Array<'green' | 'blue' | 'amber'> = ['blue', 'green', 'amber']
  const dot: Record<string, string> = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
  }
  return (
    <div className="flex h-24 flex-col justify-center gap-2">
      {rows.map((color, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className={`h-2 w-2 shrink-0 rounded-full ${dot[color]}`} />
          <div className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-2 w-8 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
      ))}
    </div>
  )
}

export function TemplatesMockup() {
  return (
    <div className="flex h-24 items-center gap-2">
      <div className="flex h-full w-8 shrink-0 flex-col items-center justify-center gap-1.5 rounded bg-slate-100 dark:bg-slate-800">
        <span className="h-1 w-1 rounded-full bg-slate-400 dark:bg-slate-500" />
        <span className="h-1 w-1 rounded-full bg-slate-400 dark:bg-slate-500" />
        <span className="h-1 w-1 rounded-full bg-slate-400 dark:bg-slate-500" />
      </div>
      <div className="relative flex-1 rounded border border-dashed border-indigo-300 bg-indigo-50/60 dark:border-indigo-800 dark:bg-indigo-950/30">
        <div className="absolute left-3 top-3 h-2 w-10 rounded-full bg-indigo-300 dark:bg-indigo-700" />
        <div className="absolute left-3 top-8 h-2 w-16 rounded-full bg-slate-300 dark:bg-slate-600" />
        <div className="absolute bottom-3 right-3 h-6 w-6 rounded bg-indigo-200 dark:bg-indigo-900/60" />
      </div>
    </div>
  )
}

export function CustomersMockup() {
  return (
    <div className="flex h-24 flex-col justify-center gap-2.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-200 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
            {['A', 'B', 'C'][i]}
          </div>
          <div className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  )
}

export function SettingsMockup() {
  return (
    <div className="flex h-24 flex-col gap-2">
      <div className="flex gap-3 border-b border-slate-200 pb-1.5 dark:border-slate-700">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1.5 w-8 rounded-full ${i === 0 ? 'bg-slate-900 dark:bg-slate-100' : 'bg-slate-200 dark:bg-slate-700'}`} />
        ))}
      </div>
      <div className="grid flex-1 grid-cols-3 gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  )
}
