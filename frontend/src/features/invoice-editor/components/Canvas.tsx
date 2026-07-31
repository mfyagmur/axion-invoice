import { useEffect, type RefObject } from 'react'
import { A4_HEIGHT_MM, A4_WIDTH_MM } from '@/features/invoice-editor/canvasGeometry'
import { PlacedField } from '@/features/invoice-editor/components/PlacedField'
import { useEditorStore } from '@/features/invoice-editor/store/editorStore'

interface CanvasProps {
  containerRef: RefObject<HTMLDivElement | null>
  scale: number
  onScaleChange: (scale: number) => void
  fieldLabel: (fieldKey: string) => string
}

export function Canvas({ containerRef, scale, onScaleChange, fieldLabel }: CanvasProps) {
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
    </div>
  )
}
