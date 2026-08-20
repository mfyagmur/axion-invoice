import { useEffect } from 'react'
import { clamp, pageDimensionsMm } from '@/features/invoice-editor/canvasGeometry'
import { copyToClipboard, hasClipboardContent, pasteFromClipboard } from '@/features/invoice-editor/utils/clipboard'
import { useEditorStore } from '@/features/invoice-editor/store/editorStore'

export function useKeyboardShortcuts() {
  const elements = useEditorStore((state) => state.elements)
  const selectedIds = useEditorStore((state) => state.selectedIds)
  const orientation = useEditorStore((state) => state.orientation)
  const removeElements = useEditorStore((state) => state.removeElements)
  const duplicateElements = useEditorStore((state) => state.duplicateElements)
  const addElements = useEditorStore((state) => state.addElements)
  const updateElement = useEditorStore((state) => state.updateElement)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      const isEditableTarget = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
        return
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        redo()
        return
      }

      if (isEditableTarget) return

      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedIds.length > 0) {
        event.preventDefault()
        removeElements(selectedIds)
        return
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd' && selectedIds.length > 0) {
        event.preventDefault()
        duplicateElements(selectedIds)
        return
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c' && selectedIds.length > 0) {
        copyToClipboard(elements.filter((el) => selectedIds.includes(el.id)))
        return
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v' && hasClipboardContent()) {
        event.preventDefault()
        const nextZ = Math.max(0, ...elements.map((el) => el.z_index)) + 1
        addElements(pasteFromClipboard(nextZ))
        return
      }

      if (selectedIds.length === 1 && event.key.startsWith('Arrow')) {
        const element = elements.find((el) => el.id === selectedIds[0])
        if (!element || element.locked) return

        const { width: pageWidthMm, height: pageHeightMm } = pageDimensionsMm(orientation)
        const step = event.shiftKey ? 5 : 1
        let dxMm = 0
        let dyMm = 0
        if (event.key === 'ArrowUp') dyMm = -step
        else if (event.key === 'ArrowDown') dyMm = step
        else if (event.key === 'ArrowLeft') dxMm = -step
        else if (event.key === 'ArrowRight') dxMm = step
        else return

        event.preventDefault()
        updateElement(element.id, {
          x_mm: clamp(element.x_mm + dxMm, 0, pageWidthMm - element.width_mm),
          y_mm: clamp(element.y_mm + dyMm, 0, pageHeightMm - element.height_mm),
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, selectedIds, orientation])
}
