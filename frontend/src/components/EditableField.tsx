import { useState } from 'react'
import { Pencil } from 'lucide-react'

interface EditableFieldProps {
  value: string
  onSave: (newValue: string) => void
  onBeforeEdit?: () => boolean
}

export function EditableField({ value, onSave, onBeforeEdit }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  if (isEditing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setIsEditing(false)
          if (draft.trim() !== value) onSave(draft.trim())
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') {
            setDraft(value)
            setIsEditing(false)
          }
        }}
        className="w-full rounded border border-slate-300 px-1 py-0.5 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (onBeforeEdit?.()) return
        setDraft(value)
        setIsEditing(true)
      }}
      className="group flex items-center gap-1 text-left text-slate-900 dark:text-slate-100"
    >
      <span>{value || '—'}</span>
      <Pencil size={16} className="shrink-0 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-500" />
    </button>
  )
}
