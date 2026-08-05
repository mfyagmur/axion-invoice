interface TabItem {
  key: string
  label: string
}

interface TabsProps {
  items: TabItem[]
  activeKey: string
  onChange: (key: string) => void
}

export function Tabs({ items, activeKey, onChange }: TabsProps) {
  return (
    <div className="flex gap-6 border-b border-slate-200">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          className={
            item.key === activeKey
              ? 'border-b-2 border-slate-900 pb-3 text-sm font-medium text-slate-900'
              : 'border-b-2 border-transparent pb-3 text-sm font-medium text-slate-500 hover:text-slate-700'
          }
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
