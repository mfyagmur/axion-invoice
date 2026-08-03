import { useDraggable } from '@dnd-kit/core'
import { twMerge } from 'tailwind-merge'
import { MM_PER_PT, mmToPx } from '@/features/invoice-editor/canvasGeometry'
import type { PaletteDragData } from '@/features/invoice-editor/dndTypes'
import { useEditorStore } from '@/features/invoice-editor/store/editorStore'
import type { LayoutFieldEntry } from '@/types/template'

interface PlacedFieldProps {
  entry: LayoutFieldEntry
  label: string
  scale: number
}

export function PlacedField({ entry, label, scale }: PlacedFieldProps) {
  const selectedFieldKey = useEditorStore((state) => state.selectedFieldKey)
  const selectField = useEditorStore((state) => state.selectField)
  const isSelected = selectedFieldKey === entry.field_key

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `placed-${entry.field_key}`,
    data: { type: 'placed-field', fieldKey: entry.field_key } satisfies PaletteDragData,
  })

  const style = {
    left: mmToPx(entry.x_mm, scale),
    top: mmToPx(entry.y_mm, scale),
    width: mmToPx(entry.width_mm, scale),
    height: mmToPx(entry.height_mm, scale),
    fontSize: mmToPx(entry.font_size * MM_PER_PT, scale),
    fontWeight: entry.bold ? 700 : 400,
    textAlign: entry.align,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  } as const

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(event) => {
        event.stopPropagation()
        selectField(entry.field_key)
      }}
      className={twMerge(
        'absolute flex cursor-move items-center overflow-hidden border border-dashed border-slate-400 bg-white/80 px-1 text-slate-800 transition-shadow',
        isSelected && 'border-solid border-slate-900 ring-2 ring-slate-900',
        isDragging && 'z-20 scale-[1.02] border-solid border-blue-500 bg-white shadow-lg ring-2 ring-blue-400',
      )}
    >
      {label}
    </div>
  )
}
