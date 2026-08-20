import { useState, type RefObject } from 'react'
import { pageDimensionsMm, mmToPx, pxToMm, type SnapGuides as SnapGuidesData } from '@/features/invoice-editor/canvasGeometry'
import { CanvasElement } from '@/features/invoice-editor/components/A4Canvas/CanvasElement'
import { ResizeHandles } from '@/features/invoice-editor/components/A4Canvas/ResizeHandles'
import { SnapGuides } from '@/features/invoice-editor/components/A4Canvas/SnapGuides'
import { useEditorStore } from '@/features/invoice-editor/store/editorStore'
import type { Orientation } from '@/types/template'

interface A4PageProps {
  containerRef: RefObject<HTMLDivElement | null>
  scale: number
  orientation: Orientation
  guides?: SnapGuidesData
  readOnly?: boolean
}

export function A4Page({ containerRef, scale, orientation, guides, readOnly }: A4PageProps) {
  const elements = useEditorStore((state) => state.elements)
  const selectedIds = useEditorStore((state) => state.selectedIds)
  const selectOnly = useEditorStore((state) => state.selectOnly)
  const selectAdd = useEditorStore((state) => state.selectAdd)
  const selectMany = useEditorStore((state) => state.selectMany)
  const clearSelection = useEditorStore((state) => state.clearSelection)

  const { width: pageWidthMm, height: pageHeightMm } = pageDimensionsMm(orientation)
  const [marquee, setMarquee] = useState<{ startX: number; startY: number; x: number; y: number } | null>(null)

  const selectedElement = selectedIds.length === 1 ? elements.find((el) => el.id === selectedIds[0]) : undefined

  function handlePointerDown(event: React.PointerEvent) {
    if (readOnly) return
    if (event.target !== event.currentTarget) return
    const rect = event.currentTarget.getBoundingClientRect()
    const startX = event.clientX - rect.left
    const startY = event.clientY - rect.top
    setMarquee({ startX, startY, x: startX, y: startY })
    if (!event.shiftKey) clearSelection()

    function handleMove(moveEvent: PointerEvent) {
      const x = clampToRect(moveEvent.clientX - rect.left, rect.width)
      const y = clampToRect(moveEvent.clientY - rect.top, rect.height)
      setMarquee((prev) => (prev ? { ...prev, x, y } : prev))
    }

    function handleUp(upEvent: PointerEvent) {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      const endX = clampToRect(upEvent.clientX - rect.left, rect.width)
      const endY = clampToRect(upEvent.clientY - rect.top, rect.height)
      const selLeft = pxToMm(Math.min(startX, endX), scale)
      const selTop = pxToMm(Math.min(startY, endY), scale)
      const selRight = pxToMm(Math.max(startX, endX), scale)
      const selBottom = pxToMm(Math.max(startY, endY), scale)

      if (Math.abs(endX - startX) > 3 || Math.abs(endY - startY) > 3) {
        const intersecting = elements
          .filter((el) => !el.hidden && el.x_mm < selRight && el.x_mm + el.width_mm > selLeft && el.y_mm < selBottom && el.y_mm + el.height_mm > selTop)
          .map((el) => el.id)
        selectMany(intersecting)
      }
      setMarquee(null)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  function clampToRect(value: number, max: number): number {
    return Math.min(Math.max(value, 0), max)
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className="relative shrink-0 border border-slate-300 bg-white shadow-sm"
      style={{
        width: mmToPx(pageWidthMm, scale),
        height: mmToPx(pageHeightMm, scale),
        backgroundImage: readOnly ? undefined : `linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)`,
        backgroundSize: readOnly ? undefined : `${mmToPx(5, scale)}px ${mmToPx(5, scale)}px`,
      }}
    >
      {[...elements]
        .sort((a, b) => a.z_index - b.z_index)
        .map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            scale={scale}
            isSelected={selectedIds.includes(element.id)}
            onSelect={(id, additive) => (additive ? selectAdd(id) : selectOnly(id))}
            readOnly={readOnly}
          />
        ))}

      {!readOnly && selectedElement && <ResizeHandles element={selectedElement} scale={scale} pageWidthMm={pageWidthMm} pageHeightMm={pageHeightMm} />}

      {!readOnly && guides && <SnapGuides guides={guides} scale={scale} />}

      {!readOnly && marquee && (
        <div
          className="pointer-events-none absolute z-50 border border-blue-500 bg-blue-500/10"
          style={{
            left: Math.min(marquee.startX, marquee.x),
            top: Math.min(marquee.startY, marquee.y),
            width: Math.abs(marquee.x - marquee.startX),
            height: Math.abs(marquee.y - marquee.startY),
          }}
        />
      )}
    </div>
  )
}
