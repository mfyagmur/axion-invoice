import { useState } from 'react'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'

interface Definition {
  id: string
  name?: string
  label?: string
  rate?: number
  days?: number
  is_active: boolean
  created_at: string
}

type FormValues = Record<string, string>
type Payload = Record<string, unknown>

interface DefinitionListSectionProps<T extends Definition> {
  title: string
  items: T[]
  isLoading: boolean
  onCreate: (payload: Payload) => void
  onUpdate: (id: string, payload: Payload) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isToggling: boolean
  fields: string[]
  renderFields: (values: FormValues, setValue: (key: string, value: string) => void) => React.ReactNode
  buildPayload: (values: FormValues) => Payload
  getEditValues: (item: T) => FormValues
  formatValue: (item: T) => string
}

const EMPTY_FORM: FormValues = {}

export function DefinitionListSection<T extends Definition>({
  title,
  items,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
  onToggleStatus,
  isCreating,
  isUpdating,
  isDeleting,
  isToggling,
  fields,
  renderFields,
  buildPayload,
  getEditValues,
  formatValue,
}: DefinitionListSectionProps<T>) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<FormValues>(EMPTY_FORM)

  const setValue = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  const isFormValid = fields.every((field) => (formValues[field] ?? '').trim().length > 0)

  const handleAdd = () => {
    if (!isFormValid) return
    onCreate(buildPayload(formValues))
    setFormValues(EMPTY_FORM)
    setIsFormOpen(false)
  }

  const handleEdit = (item: T) => {
    setEditingId(item.id)
    setFormValues(getEditValues(item))
    setIsFormOpen(true)
  }

  const handleUpdate = () => {
    if (!isFormValid || !editingId) return
    onUpdate(editingId, buildPayload(formValues))
    setFormValues(EMPTY_FORM)
    setEditingId(null)
    setIsFormOpen(false)
  }

  const handleCancel = () => {
    setFormValues(EMPTY_FORM)
    setEditingId(null)
    setIsFormOpen(false)
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-900">{title}</h3>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)} disabled={isLoading} className="px-3 py-1 text-xs">
            Add
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div className="mb-4 flex gap-2 p-3 rounded-md bg-slate-50 border border-slate-200">
          <div className="flex flex-1 gap-2">{renderFields(formValues, setValue)}</div>
          <div className="flex gap-1 items-end">
            <Button
              onClick={editingId ? handleUpdate : handleAdd}
              disabled={isUpdating || isCreating || !isFormValid}
              className="px-3 py-1 text-xs"
            >
              {editingId ? 'Update' : 'Add'}
            </Button>
            <Button variant="secondary" onClick={handleCancel} className="px-3 py-1 text-xs">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : items.length > 0 ? (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-md border border-slate-200 p-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-700">{formatValue(item)}</span>
                {!item.is_active && <Badge color="slate">Inactive</Badge>}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="secondary"
                  onClick={() => onToggleStatus(item.id)}
                  disabled={isToggling}
                  className="px-3 py-1 text-xs"
                >
                  {item.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleEdit(item)}
                  disabled={isUpdating}
                  className="px-3 py-1 text-xs"
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onDelete(item.id)}
                  disabled={isDeleting}
                  className="px-3 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No items yet</p>
      )}
    </div>
  )
}
