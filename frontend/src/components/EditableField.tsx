import { useState } from 'react'
import { Pencil } from 'lucide-react'

interface EditableFieldProps {
  value: string
  onSave: (newValue: string) => void
}

export function EditableField({ value, onSave }: EditableFieldProps) {
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
        className="w-full rounded border border-slate-300 px-1 py-0.5 text-sm focus:border-slate-500 focus:outline-none"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value)
        setIsEditing(true)
      }}
      className="group flex items-center gap-1 text-left text-slate-900"
    >
      <span>{value || '—'}</span>
      <Pencil size={16} className="shrink-0 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  )
}
