import { GripVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/Input'
import type { InvoiceTableElement, TableColumn } from '@/features/invoice-editor/types/element'

interface TableColumnEditorProps {
  element: InvoiceTableElement
  onChange: (columns: TableColumn[]) => void
}

export function TableColumnEditor({ element, onChange }: TableColumnEditorProps) {
  const { t } = useTranslation()

  function updateColumn(index: number, patch: Partial<TableColumn>) {
    onChange(element.columns.map((column, i) => (i === index ? { ...column, ...patch } : column)))
  }

  function moveColumn(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= element.columns.length) return
    const next = [...element.columns]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{t('editor.table.columns')}</span>
      <div className="flex flex-col gap-1.5">
        {element.columns.map((column, index) => (
          <div key={column.key} className="flex items-center gap-1.5 rounded-md border border-slate-200 p-1.5">
            <div className="flex flex-col text-slate-300">
              <button type="button" onClick={() => moveColumn(index, -1)} disabled={index === 0} className="disabled:opacity-30">
                <GripVertical size={12} />
              </button>
            </div>
            <input type="checkbox" checked={column.visible} onChange={(e) => updateColumn(index, { visible: e.target.checked })} />
            <input
              value={column.label}
              onChange={(e) => updateColumn(index, { label: e.target.value })}
              className="w-24 min-w-0 flex-1 rounded border border-slate-200 px-1.5 py-0.5 text-xs"
            />
            <Input
              hideLabel
              label={t('editor.table.width')}
              type="number"
              min={5}
              value={column.width_mm}
              onChange={(e) => updateColumn(index, { width_mm: Number(e.target.value) })}
              className="w-14 shrink-0 px-1.5 py-0.5 text-xs"
            />
            <button type="button" onClick={() => moveColumn(index, 1)} disabled={index === element.columns.length - 1} className="text-slate-300 disabled:opacity-30">
              <GripVertical size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
