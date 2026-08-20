import { useDraggable } from '@dnd-kit/core'
import { twMerge } from 'tailwind-merge'
import { mmToPx } from '@/features/invoice-editor/canvasGeometry'
import type { PaletteDragData } from '@/features/invoice-editor/dndTypes'
import type { CanvasElementData } from '@/features/invoice-editor/types/element'

interface CanvasElementProps {
  element: CanvasElementData
  scale: number
  isSelected: boolean
  onSelect: (id: string, additive: boolean) => void
  readOnly?: boolean
}

function ElementContent({ element }: { element: CanvasElementData }) {
  switch (element.type) {
    case 'text':
      return (
        <div
          className="h-full w-full overflow-hidden whitespace-pre-wrap break-words"
          style={{
            fontSize: `${element.font_size}pt`,
            fontWeight: element.font_weight,
            fontStyle: element.font_style,
            color: element.color,
            backgroundColor: element.background_color ?? undefined,
            textAlign: element.text_align,
            lineHeight: element.line_height,
          }}
        >
          {element.content || <span className="text-slate-400">Metin</span>}
        </div>
      )
    case 'dynamic-field':
      return (
        <div
          className="h-full w-full overflow-hidden whitespace-pre-wrap break-words"
          style={{
            fontSize: `${element.font_size}pt`,
            fontWeight: element.font_weight,
            fontStyle: element.font_style,
            color: element.color,
            textAlign: element.text_align,
            lineHeight: element.line_height,
          }}
        >
          {element.label || element.field_key || 'Dinamik Alan'}
        </div>
      )
    case 'line':
      return <div className="w-full" style={{ height: 0, borderTop: `${Math.max(element.stroke_width, 0.2)}mm solid ${element.stroke_color}` }} />
    case 'rectangle':
      return (
        <div
          className="h-full w-full"
          style={{
            backgroundColor: element.fill_color ?? undefined,
            border: `${element.border_width}mm solid ${element.border_color}`,
            borderRadius: `${element.border_radius}mm`,
          }}
        />
      )
    case 'logo':
      return <div className="flex h-full w-full items-center justify-center border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">Logo</div>
    case 'image':
      return element.src ? (
        <img src={element.src} className="h-full w-full" style={{ objectFit: element.object_fit === 'original' ? 'none' : element.object_fit }} />
      ) : (
        <div className="flex h-full w-full items-center justify-center border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">Resim</div>
      )
    case 'qrcode':
      return <div className="flex h-full w-full items-center justify-center border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">QR</div>
    case 'signature':
      return (
        <div className="flex h-full w-full flex-col justify-end">
          <div className="border-t border-slate-700" />
          <div className="text-center text-[7pt] text-slate-600">{element.label}</div>
        </div>
      )
    case 'bank-account':
      return (
        <div className="h-full w-full overflow-hidden text-slate-700" style={{ fontSize: `${element.font_size}pt`, textAlign: element.text_align, color: element.color }}>
          Banka Hesabı - {element.slot}
        </div>
      )
    case 'table':
      return (
        <div className="h-full w-full overflow-hidden border border-slate-300 bg-white">
          <div className="flex" style={{ backgroundColor: element.header_bg_color, color: element.header_text_color, fontSize: `${element.header_font_size}pt` }}>
            {element.columns.filter((c) => c.visible).map((c) => (
              <div key={c.key} className="truncate border-r border-slate-200 px-1 py-0.5 last:border-r-0" style={{ flexBasis: `${c.width_mm}mm`, textAlign: c.align }}>
                {c.label || c.key}
              </div>
            ))}
          </div>
          <div className="px-1 py-2 text-center text-[7pt] text-slate-400">Kalemler (fatura oluşturulunca doldurulur)</div>
        </div>
      )
  }
}

export function CanvasElement({ element, scale, isSelected, onSelect, readOnly }: CanvasElementProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `el-${element.id}`,
    data: { type: 'placed-element', elementId: element.id } satisfies PaletteDragData,
    disabled: element.locked || readOnly,
  })

  const style = {
    left: mmToPx(element.x_mm, scale),
    top: mmToPx(element.y_mm, scale),
    width: mmToPx(element.width_mm, scale),
    height: mmToPx(element.height_mm, scale),
    zIndex: element.z_index,
    transform: [
      transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    ].filter(Boolean).join(' ') || undefined,
    fontSize: undefined,
  } as const

  if (element.hidden) return null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(element.locked || readOnly ? {} : listeners)}
      {...(element.locked || readOnly ? {} : attributes)}
      onClick={(event) => {
        if (readOnly) return
        event.stopPropagation()
        onSelect(element.id, event.shiftKey)
      }}
      className={twMerge(
        'absolute',
        readOnly ? 'cursor-default' : element.locked ? 'cursor-not-allowed' : 'cursor-move',
        !readOnly && isSelected && 'outline-2 outline-offset-1 outline-blue-500',
        isDragging && 'opacity-80 shadow-lg',
      )}
    >
      <ElementContent element={element} />
    </div>
  )
}
