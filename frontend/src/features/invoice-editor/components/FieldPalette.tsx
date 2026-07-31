import { useDraggable } from '@dnd-kit/core'
import { PlusSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { BUILTIN_FIELD_CATALOG, CUSTOM_FIELD_PALETTE_KEY } from '@/features/invoice-editor/constants/fieldCatalog'
import type { FieldCatalogEntry } from '@/features/invoice-editor/constants/fieldCatalog'
import type { PaletteDragData } from '@/features/invoice-editor/dndTypes'

function PaletteItem({ fieldKey, label, data }: { fieldKey: string; label: string; data: PaletteDragData }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `palette-${fieldKey}`,
    data,
  })

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      className="cursor-move rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-700 hover:border-slate-400"
    >
      {label}
    </button>
  )
}

export function FieldPalette() {
  const { t } = useTranslation()

  return (
    <div className="flex w-full flex-col gap-2 lg:w-56 lg:shrink-0">
      <h2 className="text-sm font-semibold text-slate-900">{t('editor.palette.title')}</h2>
      {BUILTIN_FIELD_CATALOG.map((entry: FieldCatalogEntry) => (
        <PaletteItem
          key={entry.field_key}
          fieldKey={entry.field_key}
          label={t(entry.labelKey)}
          data={{ type: 'palette-item', catalogEntry: entry }}
        />
      ))}
      <PaletteItem
        fieldKey={CUSTOM_FIELD_PALETTE_KEY}
        label={t('editor.field.custom_blank')}
        data={{ type: 'palette-item', catalogEntry: null }}
      />
      <span className="mt-1 flex items-center gap-1 text-xs text-slate-400">
        <PlusSquare size={14} />
        {t('editor.palette.dragHint')}
      </span>
    </div>
  )
}
