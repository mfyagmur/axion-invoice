import { Eye, Pencil, Redo2, RotateCcw, Undo2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { ZOOM_LEVELS } from '@/features/invoice-editor/canvasGeometry'
import type { Orientation } from '@/types/template'

interface EditorToolbarProps {
  name: string
  onNameChange: (name: string) => void
  onSave: () => void
  isSaving: boolean
  zoom: number
  onZoomChange: (zoom: number) => void
  orientation: Orientation
  onOrientationChange: (orientation: Orientation) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  isPreview: boolean
  onTogglePreview: () => void
}

export function EditorToolbar({
  name,
  onNameChange,
  onSave,
  isSaving,
  zoom,
  onZoomChange,
  orientation,
  onOrientationChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isPreview,
  onTogglePreview,
}: EditorToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 shadow-sm">
      <Input label={t('editor.actions.templateName')} hideLabel value={name} onChange={(e) => onNameChange(e.target.value)} className="max-w-xs" placeholder={t('editor.actions.templateName')} />

      <div className="flex items-center gap-2">
        <button type="button" onClick={onUndo} disabled={!canUndo} className="rounded-md border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30" title="Ctrl+Z">
          <Undo2 size={16} />
        </button>
        <button type="button" onClick={onRedo} disabled={!canRedo} className="rounded-md border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30" title="Ctrl+Y">
          <Redo2 size={16} />
        </button>

        <select
          value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        >
          {ZOOM_LEVELS.map((level) => (
            <option key={level} value={level}>
              {Math.round(level * 100)}%
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onOrientationChange(orientation === 'portrait' ? 'landscape' : 'portrait')}
          className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          title={t('editor.actions.orientation')}
        >
          <RotateCcw size={14} />
          {t(`editor.actions.orientation_${orientation}`)}
        </button>

        <button
          type="button"
          onClick={onTogglePreview}
          className={twMerge('flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50', isPreview && 'border-slate-900 bg-slate-900 text-white')}
        >
          {isPreview ? <Pencil size={14} /> : <Eye size={14} />}
          {isPreview ? t('editor.actions.editMode') : t('editor.actions.previewMode')}
        </button>

        <Button onClick={onSave} disabled={isSaving}>
          {t('editor.actions.save')}
        </Button>
      </div>
    </div>
  )
}
