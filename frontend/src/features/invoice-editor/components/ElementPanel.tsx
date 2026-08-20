import { useDraggable } from '@dnd-kit/core'
import { Type, Heading, Minus, Square, Image as ImageIcon, QrCode, PenTool, Table2, Landmark, PlusSquare } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { FIELD_CATALOG, CUSTOM_FIELD_PALETTE_KEY } from '@/features/invoice-editor/constants/fieldCatalog'
import type { PaletteDragData } from '@/features/invoice-editor/dndTypes'
import type { ElementType } from '@/features/invoice-editor/types/element'

const BASIC_ITEMS: { elementType: ElementType; labelKey: string; icon: typeof Type }[] = [
  { elementType: 'text', labelKey: 'editor.palette.text', icon: Type },
  { elementType: 'text', labelKey: 'editor.palette.heading', icon: Heading },
  { elementType: 'line', labelKey: 'editor.palette.line', icon: Minus },
  { elementType: 'rectangle', labelKey: 'editor.palette.rectangle', icon: Square },
]

const VISUAL_ITEMS: { elementType: ElementType; labelKey: string; icon: typeof Type }[] = [
  { elementType: 'logo', labelKey: 'editor.palette.logo', icon: ImageIcon },
  { elementType: 'image', labelKey: 'editor.palette.image', icon: ImageIcon },
  { elementType: 'qrcode', labelKey: 'editor.palette.qrcode', icon: QrCode },
  { elementType: 'signature', labelKey: 'editor.palette.signature', icon: PenTool },
]

const INVOICE_ITEMS: { elementType: ElementType; labelKey: string; icon: typeof Type }[] = [
  { elementType: 'table', labelKey: 'editor.palette.table', icon: Table2 },
  { elementType: 'bank-account', labelKey: 'editor.palette.bankAccount', icon: Landmark },
]

function DraggableItem({ id, label, data, icon: Icon }: { id: string; label: string; data: PaletteDragData; icon: typeof Type }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, data })
  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      className={twMerge(
        'flex cursor-move items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-700 hover:border-slate-400',
        isDragging && 'opacity-40',
      )}
    >
      <Icon size={14} className="shrink-0 text-slate-400" />
      <span className="truncate">{label}</span>
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={() => setOpen((v) => !v)} className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </button>
      {open && <div className="flex flex-col gap-1.5">{children}</div>}
    </div>
  )
}

export function ElementPanel() {
  const { t } = useTranslation()

  return (
    <div className="flex w-full flex-col gap-4 overflow-y-auto lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:w-64 lg:shrink-0">
      <h2 className="text-sm font-semibold text-slate-900">{t('editor.palette.title')}</h2>

      <Section title={t('editor.palette.sectionBasic')}>
        {BASIC_ITEMS.map((item, index) => (
          <DraggableItem
            key={`${item.elementType}-${index}`}
            id={`palette-basic-${index}`}
            label={t(item.labelKey)}
            icon={item.icon}
            data={{ type: 'palette-element', elementType: item.elementType }}
          />
        ))}
      </Section>

      <Section title={t('editor.palette.sectionVisual')}>
        {VISUAL_ITEMS.map((item) => (
          <DraggableItem
            key={item.elementType}
            id={`palette-visual-${item.elementType}`}
            label={t(item.labelKey)}
            icon={item.icon}
            data={{ type: 'palette-element', elementType: item.elementType }}
          />
        ))}
      </Section>

      <Section title={t('editor.palette.sectionInvoice')}>
        {INVOICE_ITEMS.map((item) => (
          <DraggableItem
            key={item.elementType}
            id={`palette-invoice-${item.elementType}`}
            label={t(item.labelKey)}
            icon={item.icon}
            data={{ type: 'palette-element', elementType: item.elementType }}
          />
        ))}
      </Section>

      {FIELD_CATALOG.map((category) => (
        <Section key={category.categoryKey} title={t(`editor.palette.category.${category.categoryKey}`)}>
          {category.entries.map((entry) => (
            <DraggableItem
              key={entry.field_key}
              id={`palette-field-${entry.field_key}`}
              label={t(entry.labelKey)}
              icon={Type}
              data={{ type: 'palette-field', catalogEntry: entry }}
            />
          ))}
        </Section>
      ))}

      <Section title={t('editor.palette.sectionCustom')}>
        <DraggableItem
          id={`palette-custom-${CUSTOM_FIELD_PALETTE_KEY}`}
          label={t('editor.field.custom_blank')}
          icon={PlusSquare}
          data={{ type: 'palette-custom' }}
        />
      </Section>

      <span className="mt-1 flex items-center gap-1 text-xs text-slate-400">
        <PlusSquare size={14} />
        {t('editor.palette.dragHint')}
      </span>
    </div>
  )
}
