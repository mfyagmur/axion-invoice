import { mmToPx, type SnapGuides as SnapGuidesData } from '@/features/invoice-editor/canvasGeometry'

export function SnapGuides({ guides, scale }: { guides: SnapGuidesData; scale: number }) {
  return (
    <>
      {guides.vertical != null && (
        <div className="pointer-events-none absolute top-0 bottom-0 z-40 w-px bg-blue-500" style={{ left: mmToPx(guides.vertical, scale) }} />
      )}
      {guides.horizontal != null && (
        <div className="pointer-events-none absolute left-0 right-0 z-40 h-px bg-blue-500" style={{ top: mmToPx(guides.horizontal, scale) }} />
      )}
    </>
  )
}
