import type { CanvasElementData } from '@/features/invoice-editor/types/element'

let clipboard: CanvasElementData[] = []

export function copyToClipboard(elements: CanvasElementData[]): void {
  clipboard = elements.map((el) => ({ ...el }))
}

export function pasteFromClipboard(nextZIndex: number): CanvasElementData[] {
  return clipboard.map((el, index) => ({
    ...el,
    id: `el_${crypto.randomUUID().slice(0, 8)}`,
    x_mm: el.x_mm + 5,
    y_mm: el.y_mm + 5,
    z_index: nextZIndex + index,
  }))
}

export function hasClipboardContent(): boolean {
  return clipboard.length > 0
}
