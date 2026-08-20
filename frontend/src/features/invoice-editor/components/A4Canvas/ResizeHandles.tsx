import { useRef } from 'react'
import { clamp, mmToPx, pxToMm } from '@/features/invoice-editor/canvasGeometry'
import { useEditorStore } from '@/features/invoice-editor/store/editorStore'
import { RESIZABLE_MIN_MM, type CanvasElementData } from '@/features/invoice-editor/types/element'

type HandleDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

const HANDLES: { dir: HandleDir; className: string }[] = [
  { dir: 'nw', className: '-left-1 -top-1 cursor-nwse-resize' },
  { dir: 'n', className: 'left-1/2 -top-1 -translate-x-1/2 cursor-ns-resize' },
  { dir: 'ne', className: '-right-1 -top-1 cursor-nesw-resize' },
  { dir: 'e', className: '-right-1 top-1/2 -translate-y-1/2 cursor-ew-resize' },
  { dir: 'se', className: '-right-1 -bottom-1 cursor-nwse-resize' },
  { dir: 's', className: 'left-1/2 -bottom-1 -translate-x-1/2 cursor-ns-resize' },
  { dir: 'sw', className: '-left-1 -bottom-1 cursor-nesw-resize' },
  { dir: 'w', className: '-left-1 top-1/2 -translate-y-1/2 cursor-ew-resize' },
]

interface ResizeHandlesProps {
  element: CanvasElementData
  scale: number
  pageWidthMm: number
  pageHeightMm: number
}

export function ResizeHandles({ element, scale, pageWidthMm, pageHeightMm }: ResizeHandlesProps) {
  const updateElementLive = useEditorStore((state) => state.updateElementLive)
  const commit = useEditorStore((state) => state.commit)
  const startRef = useRef<{ x: number; y: number; el: CanvasElementData } | null>(null)

  if (element.locked) return null

  function handlePointerDown(event: React.PointerEvent, dir: HandleDir) {
    event.stopPropagation()
    event.preventDefault()
    ;(event.target as Element).setPointerCapture(event.pointerId)
    startRef.current = { x: event.clientX, y: event.clientY, el: element }

    function handleMove(moveEvent: PointerEvent) {
      const start = startRef.current
      if (!start) return
      const dxMm = pxToMm(moveEvent.clientX - start.x, scale)
      const dyMm = pxToMm(moveEvent.clientY - start.y, scale)
      let { x_mm, y_mm, width_mm, height_mm } = start.el

      if (dir.includes('e')) width_mm = clamp(start.el.width_mm + dxMm, RESIZABLE_MIN_MM, pageWidthMm - start.el.x_mm)
      if (dir.includes('s')) height_mm = clamp(start.el.height_mm + dyMm, RESIZABLE_MIN_MM, pageHeightMm - start.el.y_mm)
      if (dir.includes('w')) {
        const newWidth = clamp(start.el.width_mm - dxMm, RESIZABLE_MIN_MM, start.el.x_mm + start.el.width_mm)
        x_mm = start.el.x_mm + start.el.width_mm - newWidth
        width_mm = newWidth
      }
      if (dir.includes('n')) {
        const newHeight = clamp(start.el.height_mm - dyMm, RESIZABLE_MIN_MM, start.el.y_mm + start.el.height_mm)
        y_mm = start.el.y_mm + start.el.height_mm - newHeight
        height_mm = newHeight
      }

      updateElementLive(element.id, { x_mm, y_mm, width_mm, height_mm })
    }

    function handleUp() {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      startRef.current = null
      commit()
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  return (
    <div
      className="pointer-events-none absolute z-50"
      style={{
        left: mmToPx(element.x_mm, scale),
        top: mmToPx(element.y_mm, scale),
        width: mmToPx(element.width_mm, scale),
        height: mmToPx(element.height_mm, scale),
      }}
    >
      {HANDLES.map(({ dir, className }) => (
        <div
          key={dir}
          onPointerDown={(event) => handlePointerDown(event, dir)}
          className={`pointer-events-auto absolute h-2.5 w-2.5 rounded-full border border-white bg-blue-500 ${className}`}
        />
      ))}
    </div>
  )
}
