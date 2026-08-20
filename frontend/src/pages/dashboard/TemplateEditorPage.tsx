import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import {
  clamp,
  computeSnap,
  pageDimensionsMm,
  PX_PER_MM,
  pxToMm,
  type SnapGuides,
} from '@/features/invoice-editor/canvasGeometry'
import { A4Page } from '@/features/invoice-editor/components/A4Canvas/A4Page'
import { CustomFieldPopover } from '@/features/invoice-editor/components/CustomFieldPopover'
import { EditorToolbar } from '@/features/invoice-editor/components/EditorToolbar'
import { ElementPanel } from '@/features/invoice-editor/components/ElementPanel'
import { LayersPanel } from '@/features/invoice-editor/components/LayersPanel'
import { PropertiesPanel } from '@/features/invoice-editor/components/PropertiesPanel'
import { createDefaultElement, generateElementId } from '@/features/invoice-editor/constants/elementDefaults'
import type { PaletteDragData } from '@/features/invoice-editor/dndTypes'
import { getTemplateErrorKey } from '@/features/invoice-editor/getTemplateErrorKey'
import { useCreateTemplate } from '@/features/invoice-editor/hooks/useCreateTemplate'
import { useKeyboardShortcuts } from '@/features/invoice-editor/hooks/useKeyboardShortcuts'
import { useTemplate } from '@/features/invoice-editor/hooks/useTemplate'
import { useUpdateTemplate } from '@/features/invoice-editor/hooks/useUpdateTemplate'
import { useEditorStore } from '@/features/invoice-editor/store/editorStore'
import type { CanvasElementData, DynamicFieldElement } from '@/features/invoice-editor/types/element'
import type { FieldType } from '@/types/template'

interface PendingCustomDrop {
  xMm: number
  yMm: number
  screenTop: number
  screenLeft: number
}

export function TemplateEditorPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [isPreview, setIsPreview] = useState(false)
  const [pendingCustomDrop, setPendingCustomDrop] = useState<PendingCustomDrop | null>(null)
  const [activeDrag, setActiveDrag] = useState<PaletteDragData | null>(null)
  const [guides, setGuides] = useState<SnapGuides>({ vertical: null, horizontal: null })

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const scale = PX_PER_MM * zoom

  const { data: template, isLoading: isTemplateLoading, isError: isTemplateError } = useTemplate(id)
  const name = useEditorStore((state) => state.name)
  const pageSize = useEditorStore((state) => state.pageSize)
  const orientation = useEditorStore((state) => state.orientation)
  const elements = useEditorStore((state) => state.elements)
  const fieldMeta = useEditorStore((state) => state.fieldMeta)
  const selectedIds = useEditorStore((state) => state.selectedIds)
  const isFromSystemTemplate = useEditorStore((state) => state.isFromSystemTemplate)
  const loadTemplate = useEditorStore((state) => state.loadTemplate)
  const setName = useEditorStore((state) => state.setName)
  const setOrientation = useEditorStore((state) => state.setOrientation)
  const addElement = useEditorStore((state) => state.addElement)
  const updateElementsLive = useEditorStore((state) => state.updateElementsLive)
  const commit = useEditorStore((state) => state.commit)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const past = useEditorStore((state) => state.past)
  const future = useEditorStore((state) => state.future)
  const reset = useEditorStore((state) => state.reset)

  const { width: pageWidthMm, height: pageHeightMm } = pageDimensionsMm(orientation)

  useKeyboardShortcuts()

  useEffect(() => {
    if (template) {
      loadTemplate(template)
    }
    return () => reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template])

  const createTemplate = useCreateTemplate()
  const updateTemplate = useUpdateTemplate(id ?? '')

  const isOwnedExisting = !!id && !isFromSystemTemplate
  const isSaving = createTemplate.isPending || updateTemplate.isPending
  const saveError = createTemplate.error ?? updateTemplate.error

  function handleSave() {
    const dynamicFieldKeys = new Set(elements.filter((el) => el.type === 'dynamic-field').map((el) => (el as DynamicFieldElement).field_key))
    const fields = Object.fromEntries(Object.entries(fieldMeta).filter(([key]) => dynamicFieldKeys.has(key)))

    const payload = {
      name: name || t('editor.actions.untitled'),
      page_size: pageSize,
      orientation,
      layout_json: elements,
      fields,
    }
    if (isOwnedExisting && id) {
      updateTemplate.mutate(payload)
    } else {
      createTemplate.mutate(payload)
    }
  }

  function elementsToMove(draggedId: string): string[] {
    return selectedIds.includes(draggedId) ? selectedIds : [draggedId]
  }

  function computeGroupSnap(draggedId: string, deltaPxX: number, deltaPxY: number) {
    const primary = elements.find((el) => el.id === draggedId)
    if (!primary) return null
    const ids = elementsToMove(draggedId)
    const others = elements.filter((el) => !ids.includes(el.id)).map((el) => ({ x: el.x_mm, y: el.y_mm, width: el.width_mm, height: el.height_mm }))
    const dxMm = pxToMm(deltaPxX, scale)
    const dyMm = pxToMm(deltaPxY, scale)
    const snap = computeSnap(
      { x: primary.x_mm + dxMm, y: primary.y_mm + dyMm, width: primary.width_mm, height: primary.height_mm },
      others,
      pageWidthMm,
      pageHeightMm,
    )
    return { primary, ids, dxMm: snap.x - primary.x_mm, dyMm: snap.y - primary.y_mm, guides: snap.guides }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveDrag((event.active.data.current as PaletteDragData | undefined) ?? null)
  }

  function handleDragMove(event: DragMoveEvent) {
    const data = event.active.data.current as PaletteDragData | undefined
    if (!data || data.type !== 'placed-element') {
      setGuides({ vertical: null, horizontal: null })
      return
    }
    const result = computeGroupSnap(data.elementId, event.delta.x, event.delta.y)
    setGuides(result?.guides ?? { vertical: null, horizontal: null })
  }

  function handleDragCancel() {
    setActiveDrag(null)
    setGuides({ vertical: null, horizontal: null })
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null)
    setGuides({ vertical: null, horizontal: null })

    const data = event.active.data.current as PaletteDragData | undefined
    if (!data) return

    if (data.type === 'placed-element') {
      const result = computeGroupSnap(data.elementId, event.delta.x, event.delta.y)
      if (!result) return
      const patches: Record<string, Partial<CanvasElementData>> = {}
      for (const elId of result.ids) {
        const el = elements.find((item) => item.id === elId)
        if (!el) continue
        patches[elId] = {
          x_mm: clamp(el.x_mm + result.dxMm, 0, pageWidthMm - el.width_mm),
          y_mm: clamp(el.y_mm + result.dyMm, 0, pageHeightMm - el.height_mm),
        }
      }
      updateElementsLive(patches)
      commit()
      return
    }

    const canvasEl = canvasRef.current
    const translated = event.active.rect.current.translated
    if (!canvasEl || !translated) return

    const canvasRect = canvasEl.getBoundingClientRect()
    const xPx = translated.left - canvasRect.left
    const yPx = translated.top - canvasRect.top
    if (xPx < -20 || yPx < -20 || xPx > canvasRect.width || yPx > canvasRect.height) return

    const xMm = pxToMm(xPx, scale)
    const yMm = pxToMm(yPx, scale)
    const nextZ = Math.max(0, ...elements.map((el) => el.z_index)) + 1

    if (data.type === 'palette-custom') {
      setPendingCustomDrop({
        xMm: clamp(xMm, 0, pageWidthMm - 40),
        yMm: clamp(yMm, 0, pageHeightMm - 8),
        screenTop: translated.top,
        screenLeft: translated.left,
      })
      return
    }

    if (data.type === 'palette-element') {
      addElement(createDefaultElement(data.elementType, clamp(xMm, 0, pageWidthMm - 10), clamp(yMm, 0, pageHeightMm - 10), nextZ))
      return
    }

    if (data.type === 'palette-field') {
      const catalogEntry = data.catalogEntry
      const element: DynamicFieldElement = {
        id: generateElementId(),
        type: 'dynamic-field',
        x_mm: clamp(xMm, 0, pageWidthMm - catalogEntry.default_width_mm),
        y_mm: clamp(yMm, 0, pageHeightMm - catalogEntry.default_height_mm),
        width_mm: catalogEntry.default_width_mm,
        height_mm: catalogEntry.default_height_mm,
        rotation: 0,
        z_index: nextZ,
        locked: false,
        hidden: false,
        field_key: catalogEntry.field_key,
        label: t(catalogEntry.labelKey),
        font_size: catalogEntry.default_font_size,
        font_weight: 'normal',
        font_style: 'normal',
        color: '#1a1a1a',
        text_align: 'left',
        line_height: 1.3,
        letter_spacing: 0,
        is_custom: false,
        default_value: null,
      }
      addElement(element, { field_key: catalogEntry.field_key, meta: { field_type: catalogEntry.field_type, label: t(catalogEntry.labelKey), is_custom: false } })
    }
  }

  function handleCustomFieldConfirm(label: string, fieldType: FieldType) {
    if (!pendingCustomDrop) return
    const fieldKey = `custom.${crypto.randomUUID().slice(0, 8)}`
    const nextZ = Math.max(0, ...elements.map((el) => el.z_index)) + 1
    const element: DynamicFieldElement = {
      id: generateElementId(),
      type: 'dynamic-field',
      x_mm: pendingCustomDrop.xMm,
      y_mm: pendingCustomDrop.yMm,
      width_mm: 40,
      height_mm: 8,
      rotation: 0,
      z_index: nextZ,
      locked: false,
      hidden: false,
      field_key: fieldKey,
      label,
      font_size: 10,
      font_weight: 'normal',
      font_style: 'normal',
      color: '#1a1a1a',
      text_align: 'left',
      line_height: 1.3,
      letter_spacing: 0,
      is_custom: true,
      default_value: null,
    }
    addElement(element, { field_key: fieldKey, meta: { field_type: fieldType, label, is_custom: true } })
    setPendingCustomDrop(null)
  }

  if (isTemplateLoading) {
    return <p className="text-sm text-slate-500">{t('common.loading')}</p>
  }

  if (isTemplateError) {
    return (
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm text-red-600">{t('common.genericError')}</p>
        <Link to="/dashboard/templates" className="text-sm underline">
          {t('nav.templates')}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <EditorToolbar
        name={name}
        onNameChange={setName}
        onSave={handleSave}
        isSaving={isSaving}
        zoom={zoom}
        onZoomChange={setZoom}
        orientation={orientation}
        onOrientationChange={setOrientation}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        onUndo={undo}
        onRedo={redo}
        isPreview={isPreview}
        onTogglePreview={() => setIsPreview((v) => !v)}
      />

      {isFromSystemTemplate && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{t('editor.systemTemplateBanner')}</p>
      )}

      {saveError && (
        <p className="text-sm text-red-600">
          {t(getTemplateErrorKey(saveError))}{' '}
          <Link to="/dashboard/billing" className="underline">
            {t('nav.billing')}
          </Link>
        </p>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
          {!isPreview && <ElementPanel />}

          <div className="min-w-0 flex-1 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-6">
            <A4Page containerRef={canvasRef} scale={scale} orientation={orientation} guides={guides} readOnly={isPreview} />
          </div>

          {!isPreview && (
            <div className="flex w-full flex-col gap-4 lg:w-72 lg:shrink-0">
              <PropertiesPanel />
              <div className="rounded-lg border border-slate-200 p-3">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('editor.layers.title')}</h3>
                <LayersPanel />
              </div>
            </div>
          )}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDrag?.type === 'palette-field' && (
            <div className="cursor-move rounded-md border border-slate-400 bg-white px-3 py-2 text-sm text-slate-700 shadow-lg">{t(activeDrag.catalogEntry.labelKey)}</div>
          )}
          {activeDrag?.type === 'palette-element' && (
            <div className="cursor-move rounded-md border border-slate-400 bg-white px-3 py-2 text-sm text-slate-700 shadow-lg">{t(`editor.elementType.${activeDrag.elementType}`)}</div>
          )}
          {activeDrag?.type === 'palette-custom' && (
            <div className="cursor-move rounded-md border border-slate-400 bg-white px-3 py-2 text-sm text-slate-700 shadow-lg">{t('editor.field.custom_blank')}</div>
          )}
        </DragOverlay>
      </DndContext>

      {pendingCustomDrop && (
        <CustomFieldPopover
          position={{ top: pendingCustomDrop.screenTop, left: pendingCustomDrop.screenLeft }}
          onConfirm={handleCustomFieldConfirm}
          onCancel={() => setPendingCustomDrop(null)}
        />
      )}
    </div>
  )
}
