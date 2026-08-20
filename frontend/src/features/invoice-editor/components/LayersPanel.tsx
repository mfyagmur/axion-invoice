import { Eye, EyeOff, GripVertical, Lock, Unlock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { useEditorStore } from '@/features/invoice-editor/store/editorStore'

const TYPE_LABEL_KEYS: Record<string, string> = {
  text: 'editor.elementType.text',
  line: 'editor.elementType.line',
  rectangle: 'editor.elementType.rectangle',
  logo: 'editor.elementType.logo',
  image: 'editor.elementType.image',
  qrcode: 'editor.elementType.qrcode',
  signature: 'editor.elementType.signature',
  'dynamic-field': 'editor.elementType.dynamic-field',
  table: 'editor.elementType.table',
  'bank-account': 'editor.elementType.bank-account',
}

export function LayersPanel() {
  const { t } = useTranslation()
  const elements = useEditorStore((state) => state.elements)
  const selectedIds = useEditorStore((state) => state.selectedIds)
  const selectOnly = useEditorStore((state) => state.selectOnly)
  const toggleLock = useEditorStore((state) => state.toggleLock)
  const toggleHidden = useEditorStore((state) => state.toggleHidden)
  const reorderLayers = useEditorStore((state) => state.reorderLayers)

  const sorted = [...elements].sort((a, b) => b.z_index - a.z_index)

  function handleDragStart(event: React.DragEvent, id: string) {
    event.dataTransfer.setData('text/plain', id)
  }

  function handleDrop(event: React.DragEvent, targetId: string) {
    event.preventDefault()
    const draggedId = event.dataTransfer.getData('text/plain')
    if (draggedId === targetId) return
    const ids = sorted.map((el) => el.id)
    const fromIndex = ids.indexOf(draggedId)
    const toIndex = ids.indexOf(targetId)
    if (fromIndex === -1 || toIndex === -1) return
    ids.splice(fromIndex, 1)
    ids.splice(toIndex, 0, draggedId)
    reorderLayers(ids)
  }

  if (sorted.length === 0) {
    return <p className="text-sm text-slate-400">{t('editor.layers.empty')}</p>
  }

  return (
    <div className="flex flex-col gap-1">
      {sorted.map((element) => (
        <div
          key={element.id}
          draggable
          onDragStart={(e) => handleDragStart(e, element.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, element.id)}
          onClick={() => selectOnly(element.id)}
          className={twMerge(
            'flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-sm hover:bg-slate-50',
            selectedIds.includes(element.id) && 'border-blue-300 bg-blue-50',
          )}
        >
          <GripVertical size={14} className="shrink-0 text-slate-300" />
          <span className="min-w-0 flex-1 truncate text-slate-700">
            {element.type === 'dynamic-field' ? element.label || element.field_key : t(TYPE_LABEL_KEYS[element.type] ?? element.type)}
          </span>
          <button type="button" onClick={(e) => { e.stopPropagation(); toggleHidden(element.id) }} className="rounded p-1 text-slate-400 hover:bg-slate-200">
            {element.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); toggleLock(element.id) }} className="rounded p-1 text-slate-400 hover:bg-slate-200">
            {element.locked ? <Lock size={13} /> : <Unlock size={13} />}
          </button>
        </div>
      ))}
    </div>
  )
}
