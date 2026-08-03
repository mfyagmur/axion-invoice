import { useEffect, type RefObject } from 'react'
import { A4_HEIGHT_MM, A4_WIDTH_MM, mmToPx, type SnapGuides } from '@/features/invoice-editor/canvasGeometry'
import { PlacedField } from '@/features/invoice-editor/components/PlacedField'
import { useEditorStore } from '@/features/invoice-editor/store/editorStore'

interface CanvasProps {
  containerRef: RefObject<HTMLDivElement | null>
  scale: number
  onScaleChange: (scale: number) => void
  fieldLabel: (fieldKey: string) => string
  guides?: SnapGuides
}

export function Canvas({ containerRef, scale, onScaleChange, fieldLabel, guides }: CanvasProps) {
  const layoutEntries = useEditorStore((state) => state.layoutEntries)
  const selectField = useEditorStore((state) => state.selectField)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const updateScale = () => onScaleChange(node.clientWidth / A4_WIDTH_MM)
    updateScale()

    const observer = new ResizeObserver(updateScale)
    observer.observe(node)
    return () => observer.disconnect()
  }, [containerRef, onScaleChange])

  return (
    <div
      ref={containerRef}
      onClick={() => selectField(null)}
      className="relative mx-auto w-full max-w-[794px] border border-slate-300 bg-white shadow-sm"
      style={{ aspectRatio: `${A4_WIDTH_MM} / ${A4_HEIGHT_MM}` }}
    >
      {scale > 0 &&
        layoutEntries.map((entry) => (
          <PlacedField key={entry.field_key} entry={entry} label={fieldLabel(entry.field_key)} scale={scale} />
        ))}

      {guides?.vertical != null && (
        <div
          className="pointer-events-none absolute top-0 bottom-0 z-30 w-px bg-blue-500"
          style={{ left: mmToPx(guides.vertical, scale) }}
        />
      )}
      {guides?.horizontal != null && (
        <div
          className="pointer-events-none absolute left-0 right-0 z-30 h-px bg-blue-500"
          style={{ top: mmToPx(guides.horizontal, scale) }}
        />
      )}
    </div>
  )
}
