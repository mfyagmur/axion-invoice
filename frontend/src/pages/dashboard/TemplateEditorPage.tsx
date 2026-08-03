import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
  type Modifier,
} from '@dnd-kit/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  clamp,
  computeSnap,
  mmToPx,
  pxToMm,
  type SnapGuides,
} from '@/features/invoice-editor/canvasGeometry'
import { Canvas } from '@/features/invoice-editor/components/Canvas'
import { CustomFieldPopover } from '@/features/invoice-editor/components/CustomFieldPopover'
import { FieldPalette } from '@/features/invoice-editor/components/FieldPalette'
import { StylePanel } from '@/features/invoice-editor/components/StylePanel'
import type { PaletteDragData } from '@/features/invoice-editor/dndTypes'
import { getTemplateErrorKey } from '@/features/invoice-editor/getTemplateErrorKey'
import { useCreateTemplate } from '@/features/invoice-editor/hooks/useCreateTemplate'
import { useTemplate } from '@/features/invoice-editor/hooks/useTemplate'
import { useUpdateTemplate } from '@/features/invoice-editor/hooks/useUpdateTemplate'
import { useEditorStore } from '@/features/invoice-editor/store/editorStore'
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
  const [scale, setScale] = useState(0)
  const [pendingCustomDrop, setPendingCustomDrop] = useState<PendingCustomDrop | null>(null)
  const [activeDrag, setActiveDrag] = useState<PaletteDragData | null>(null)
  const [guides, setGuides] = useState<SnapGuides>({ vertical: null, horizontal: null })

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const { data: template, isLoading: isTemplateLoading, isError: isTemplateError } = useTemplate(id)
  const name = useEditorStore((state) => state.name)
  const pageSize = useEditorStore((state) => state.pageSize)
  const layoutEntries = useEditorStore((state) => state.layoutEntries)
  const fieldMeta = useEditorStore((state) => state.fieldMeta)
  const selectedFieldKey = useEditorStore((state) => state.selectedFieldKey)
  const isFromSystemTemplate = useEditorStore((state) => state.isFromSystemTemplate)
  const loadTemplate = useEditorStore((state) => state.loadTemplate)
  const setName = useEditorStore((state) => state.setName)
  const addField = useEditorStore((state) => state.addField)
  const moveField = useEditorStore((state) => state.moveField)
  const reset = useEditorStore((state) => state.reset)

  const snapModifier = useCallback<Modifier>(
    ({ transform, active }) => {
      if (!active || scale <= 0) return transform
      const data = active.data.current as PaletteDragData | undefined
      if (!data || data.type !== 'placed-field') return transform

      const entry = layoutEntries.find((item) => item.field_key === data.fieldKey)
      if (!entry) return transform

      const others = layoutEntries
        .filter((item) => item.field_key !== entry.field_key)
        .map((item) => ({ x: item.x_mm, y: item.y_mm, width: item.width_mm, height: item.height_mm }))

      const { x, y } = computeSnap(
        { x: entry.x_mm + pxToMm(transform.x, scale), y: entry.y_mm + pxToMm(transform.y, scale), width: entry.width_mm, height: entry.height_mm },
        others,
        A4_WIDTH_MM,
        A4_HEIGHT_MM,
      )

      return { ...transform, x: mmToPx(x - entry.x_mm, scale), y: mmToPx(y - entry.y_mm, scale) }
    },
    [layoutEntries, scale],
  )

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
    const payload = {
      name: name || t('editor.actions.untitled'),
      page_size: pageSize,
      layout_json: layoutEntries,
      fields: fieldMeta,
    }
    if (isOwnedExisting && id) {
      updateTemplate.mutate(payload)
    } else {
      createTemplate.mutate(payload)
    }
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!selectedFieldKey) return
      const target = event.target as HTMLElement
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return

      const entry = layoutEntries.find((item) => item.field_key === selectedFieldKey)
      if (!entry) return

      const step = event.shiftKey ? 5 : 1
      let dxMm = 0
      let dyMm = 0
      if (event.key === 'ArrowUp') dyMm = -step
      else if (event.key === 'ArrowDown') dyMm = step
      else if (event.key === 'ArrowLeft') dxMm = -step
      else if (event.key === 'ArrowRight') dxMm = step
      else return

      event.preventDefault()
      moveField(
        selectedFieldKey,
        clamp(entry.x_mm + dxMm, 0, A4_WIDTH_MM - entry.width_mm),
        clamp(entry.y_mm + dyMm, 0, A4_HEIGHT_MM - entry.height_mm),
      )
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedFieldKey, layoutEntries, moveField])

  function handleDragStart(event: DragStartEvent) {
    setActiveDrag((event.active.data.current as PaletteDragData | undefined) ?? null)
  }

  function handleDragMove(event: DragMoveEvent) {
    const data = event.active.data.current as PaletteDragData | undefined
    if (!data || data.type !== 'placed-field' || scale <= 0) {
      setGuides({ vertical: null, horizontal: null })
      return
    }
    const entry = layoutEntries.find((item) => item.field_key === data.fieldKey)
    if (!entry) return

    const others = layoutEntries
      .filter((item) => item.field_key !== entry.field_key)
      .map((item) => ({ x: item.x_mm, y: item.y_mm, width: item.width_mm, height: item.height_mm }))

    const { guides: nextGuides } = computeSnap(
      { x: entry.x_mm + pxToMm(event.delta.x, scale), y: entry.y_mm + pxToMm(event.delta.y, scale), width: entry.width_mm, height: entry.height_mm },
      others,
      A4_WIDTH_MM,
      A4_HEIGHT_MM,
    )
    setGuides(nextGuides)
  }

  function handleDragCancel() {
    setActiveDrag(null)
    setGuides({ vertical: null, horizontal: null })
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null)
    setGuides({ vertical: null, horizontal: null })

    const data = event.active.data.current as PaletteDragData | undefined
    if (!data || scale <= 0) return

    if (data.type === 'placed-field') {
      const entry = layoutEntries.find((item) => item.field_key === data.fieldKey)
      if (!entry) return
      const dxMm = pxToMm(event.delta.x, scale)
      const dyMm = pxToMm(event.delta.y, scale)
      moveField(
        data.fieldKey,
        clamp(entry.x_mm + dxMm, 0, A4_WIDTH_MM - entry.width_mm),
        clamp(entry.y_mm + dyMm, 0, A4_HEIGHT_MM - entry.height_mm),
      )
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

    if (data.catalogEntry === null) {
      setPendingCustomDrop({
        xMm: clamp(xMm, 0, A4_WIDTH_MM - 40),
        yMm: clamp(yMm, 0, A4_HEIGHT_MM - 8),
        screenTop: translated.top,
        screenLeft: translated.left,
      })
      return
    }

    const catalogEntry = data.catalogEntry
    if (layoutEntries.some((item) => item.field_key === catalogEntry.field_key)) return

    addField(
      {
        field_key: catalogEntry.field_key,
        x_mm: clamp(xMm, 0, A4_WIDTH_MM - catalogEntry.default_width_mm),
        y_mm: clamp(yMm, 0, A4_HEIGHT_MM - catalogEntry.default_height_mm),
        width_mm: catalogEntry.default_width_mm,
        height_mm: catalogEntry.default_height_mm,
        font_size: catalogEntry.default_font_size,
        bold: false,
        align: 'left',
      },
      { field_type: catalogEntry.field_type, label: t(catalogEntry.labelKey), is_custom: false },
    )
  }

  function handleCustomFieldConfirm(label: string, fieldType: FieldType) {
    if (!pendingCustomDrop) return
    const fieldKey = `custom_${crypto.randomUUID().slice(0, 8)}`
    addField(
      {
        field_key: fieldKey,
        x_mm: pendingCustomDrop.xMm,
        y_mm: pendingCustomDrop.yMm,
        width_mm: 40,
        height_mm: 8,
        font_size: 10,
        bold: false,
        align: 'left',
      },
      { field_type: fieldType, label, is_custom: true },
    )
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
      <div className="flex items-center justify-between gap-4">
        <Input
          label={t('editor.actions.templateName')}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="max-w-xs"
        />
        <Button onClick={handleSave} disabled={isSaving}>
          {t('editor.actions.save')}
        </Button>
      </div>

      {isFromSystemTemplate && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {t('editor.systemTemplateBanner')}
        </p>
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
        modifiers={[snapModifier]}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          <FieldPalette />
          <Canvas
            containerRef={canvasRef}
            scale={scale}
            onScaleChange={setScale}
            fieldLabel={(fieldKey) => fieldMeta[fieldKey]?.label ?? fieldKey}
            guides={guides}
          />
          <StylePanel />
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDrag?.type === 'palette-item' && (
            <div className="cursor-move rounded-md border border-slate-400 bg-white px-3 py-2 text-sm text-slate-700 shadow-lg">
              {activeDrag.catalogEntry ? t(activeDrag.catalogEntry.labelKey) : t('editor.field.custom_blank')}
            </div>
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
