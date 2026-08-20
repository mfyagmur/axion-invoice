import { AlignCenter, AlignLeft, AlignRight, Bold, Copy, Eye, EyeOff, Italic, Lock, SendToBack, BringToFront, Trash2, Unlock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { Input } from '@/components/Input'
import { TableColumnEditor } from '@/features/invoice-editor/components/TableColumnEditor'
import { useEditorStore } from '@/features/invoice-editor/store/editorStore'
import type { Align } from '@/types/template'

const ALIGN_OPTIONS: { value: Align; icon: typeof AlignLeft }[] = [
  { value: 'left', icon: AlignLeft },
  { value: 'center', icon: AlignCenter },
  { value: 'right', icon: AlignRight },
]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      {children}
    </div>
  )
}

function AlignPicker({ value, onChange }: { value: Align; onChange: (value: Align) => void }) {
  return (
    <div className="flex gap-1">
      {ALIGN_OPTIONS.map(({ value: v, icon: Icon }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={twMerge(
            'flex-1 rounded-md border border-slate-300 py-1.5 flex items-center justify-center hover:bg-slate-50',
            value === v && 'border-slate-900 bg-slate-900 text-white hover:bg-slate-900',
          )}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  )
}

export function PropertiesPanel() {
  const { t } = useTranslation()
  const elements = useEditorStore((state) => state.elements)
  const selectedIds = useEditorStore((state) => state.selectedIds)
  const updateElement = useEditorStore((state) => state.updateElement)
  const removeElements = useEditorStore((state) => state.removeElements)
  const duplicateElements = useEditorStore((state) => state.duplicateElements)
  const toggleLock = useEditorStore((state) => state.toggleLock)
  const toggleHidden = useEditorStore((state) => state.toggleHidden)
  const bringToFront = useEditorStore((state) => state.bringToFront)
  const sendToBack = useEditorStore((state) => state.sendToBack)

  if (selectedIds.length === 0) {
    return <div className="w-full text-sm text-slate-400 lg:w-72 lg:shrink-0">{t('editor.properties.emptyState')}</div>
  }

  if (selectedIds.length > 1) {
    return (
      <div className="flex w-full flex-col gap-3 lg:w-72 lg:shrink-0">
        <h2 className="text-sm font-semibold text-slate-900">{t('editor.properties.multiSelected', { count: selectedIds.length })}</h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => duplicateElements(selectedIds)} className="flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1.5 text-xs hover:bg-slate-50">
            <Copy size={14} /> {t('editor.properties.duplicate')}
          </button>
          <button type="button" onClick={() => removeElements(selectedIds)} className="flex items-center gap-1 rounded-md border border-red-300 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50">
            <Trash2 size={14} /> {t('editor.properties.delete')}
          </button>
        </div>
      </div>
    )
  }

  const element = elements.find((el) => el.id === selectedIds[0])
  if (!element) return null

  function set<K extends string>(patch: Record<K, unknown>) {
    updateElement(element!.id, patch as never)
  }

  return (
    <div className="flex w-full flex-col gap-4 overflow-y-auto lg:w-72 lg:shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">{t(`editor.elementType.${element.type}`)}</h2>
        <div className="flex gap-1">
          <button type="button" onClick={() => toggleLock(element.id)} className="rounded p-1 text-slate-500 hover:bg-slate-100" title={t('editor.properties.lock')}>
            {element.locked ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
          <button type="button" onClick={() => toggleHidden(element.id)} className="rounded p-1 text-slate-500 hover:bg-slate-100" title={t('editor.properties.hide')}>
            {element.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button type="button" onClick={() => duplicateElements([element.id])} className="rounded p-1 text-slate-500 hover:bg-slate-100" title={t('editor.properties.duplicate')}>
            <Copy size={14} />
          </button>
          <button type="button" onClick={() => removeElements([element.id])} className="rounded p-1 text-red-500 hover:bg-red-50" title={t('editor.properties.delete')}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input label="X (mm)" type="number" value={element.x_mm} onChange={(e) => set({ x_mm: Number(e.target.value) })} />
        <Input label="Y (mm)" type="number" value={element.y_mm} onChange={(e) => set({ y_mm: Number(e.target.value) })} />
        <Input label={t('editor.properties.width')} type="number" value={element.width_mm} onChange={(e) => set({ width_mm: Number(e.target.value) })} />
        <Input label={t('editor.properties.height')} type="number" value={element.height_mm} onChange={(e) => set({ height_mm: Number(e.target.value) })} />
        <Input label={t('editor.properties.rotation')} type="number" value={element.rotation} onChange={(e) => set({ rotation: Number(e.target.value) })} />
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={() => bringToFront(element.id)} className="flex flex-1 items-center justify-center gap-1 rounded-md border border-slate-300 py-1.5 text-xs hover:bg-slate-50">
          <BringToFront size={14} /> {t('editor.layers.bringToFront')}
        </button>
        <button type="button" onClick={() => sendToBack(element.id)} className="flex flex-1 items-center justify-center gap-1 rounded-md border border-slate-300 py-1.5 text-xs hover:bg-slate-50">
          <SendToBack size={14} /> {t('editor.layers.sendToBack')}
        </button>
      </div>

      <hr className="border-slate-200" />

      {(element.type === 'text' || element.type === 'dynamic-field') && (
        <>
          {element.type === 'text' && (
            <Field label={t('editor.properties.content')}>
              <textarea
                value={element.content}
                onChange={(e) => set({ content: e.target.value })}
                rows={3}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </Field>
          )}
          {element.type === 'dynamic-field' && (
            <Field label={t('editor.properties.defaultValue')}>
              <Input label={t('editor.properties.defaultValue')} hideLabel value={element.default_value ?? ''} onChange={(e) => set({ default_value: e.target.value || null })} />
            </Field>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Input label={t('editor.stylePanel.fontSize')} type="number" min={6} max={72} value={element.font_size} onChange={(e) => set({ font_size: Number(e.target.value) })} />
            <Field label={t('editor.properties.color')}>
              <input type="color" value={element.color} onChange={(e) => set({ color: e.target.value })} className="h-9 w-full rounded-md border border-slate-300" />
            </Field>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => set({ font_weight: element.font_weight === 'bold' ? 'normal' : 'bold' })} className={twMerge('flex-1 rounded-md border border-slate-300 py-1.5 flex items-center justify-center', element.font_weight === 'bold' && 'border-slate-900 bg-slate-900 text-white')}>
              <Bold size={14} />
            </button>
            <button type="button" onClick={() => set({ font_style: element.font_style === 'italic' ? 'normal' : 'italic' })} className={twMerge('flex-1 rounded-md border border-slate-300 py-1.5 flex items-center justify-center', element.font_style === 'italic' && 'border-slate-900 bg-slate-900 text-white')}>
              <Italic size={14} />
            </button>
          </div>
          <Field label={t('editor.stylePanel.align')}>
            <AlignPicker value={element.text_align} onChange={(value) => set({ text_align: value })} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Input label={t('editor.properties.lineHeight')} type="number" step={0.1} value={element.line_height} onChange={(e) => set({ line_height: Number(e.target.value) })} />
            <Input label={t('editor.properties.letterSpacing')} type="number" step={0.1} value={element.letter_spacing} onChange={(e) => set({ letter_spacing: Number(e.target.value) })} />
          </div>
        </>
      )}

      {element.type === 'line' && (
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('editor.properties.color')}>
            <input type="color" value={element.stroke_color} onChange={(e) => set({ stroke_color: e.target.value })} className="h-9 w-full rounded-md border border-slate-300" />
          </Field>
          <Input label={t('editor.properties.strokeWidth')} type="number" step={0.1} min={0.1} value={element.stroke_width} onChange={(e) => set({ stroke_width: Number(e.target.value) })} />
        </div>
      )}

      {element.type === 'rectangle' && (
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('editor.properties.fillColor')}>
            <input type="color" value={element.fill_color ?? '#ffffff'} onChange={(e) => set({ fill_color: e.target.value })} className="h-9 w-full rounded-md border border-slate-300" />
          </Field>
          <Field label={t('editor.properties.borderColor')}>
            <input type="color" value={element.border_color} onChange={(e) => set({ border_color: e.target.value })} className="h-9 w-full rounded-md border border-slate-300" />
          </Field>
          <Input label={t('editor.properties.borderWidth')} type="number" step={0.1} value={element.border_width} onChange={(e) => set({ border_width: Number(e.target.value) })} />
          <Input label={t('editor.properties.borderRadius')} type="number" step={0.5} value={element.border_radius} onChange={(e) => set({ border_radius: Number(e.target.value) })} />
        </div>
      )}

      {(element.type === 'logo' || element.type === 'image') && (
        <Field label={t('editor.properties.objectFit')}>
          <select value={element.object_fit} onChange={(e) => set({ object_fit: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="contain">Contain</option>
            <option value="cover">Cover</option>
            <option value="original">Original</option>
          </select>
        </Field>
      )}

      {element.type === 'image' && (
        <Field label={t('editor.properties.uploadImage')}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = () => set({ src: String(reader.result) })
              reader.readAsDataURL(file)
            }}
            className="text-xs"
          />
        </Field>
      )}

      {element.type === 'qrcode' && (
        <>
          <Field label={t('editor.properties.qrDataSource')}>
            <select value={element.data_source} onChange={(e) => set({ data_source: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="invoice_number">{t('editor.field.invoice_number')}</option>
              <option value="static">{t('editor.properties.qrStatic')}</option>
            </select>
          </Field>
          {element.data_source === 'static' && (
            <Input label={t('editor.properties.qrStaticValue')} value={element.static_value ?? ''} onChange={(e) => set({ static_value: e.target.value })} />
          )}
        </>
      )}

      {element.type === 'signature' && (
        <Input label={t('editor.properties.label')} value={element.label} onChange={(e) => set({ label: e.target.value })} />
      )}

      {element.type === 'bank-account' && (
        <>
          <Field label={t('editor.properties.bankAccountSlot')}>
            <select value={element.slot} onChange={(e) => set({ slot: Number(e.target.value) })} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value={1}>Banka Hesabı - 1</option>
              <option value={2}>Banka Hesabı - 2</option>
              <option value={3}>Banka Hesabı - 3</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Input label={t('editor.stylePanel.fontSize')} type="number" min={6} max={72} value={element.font_size} onChange={(e) => set({ font_size: Number(e.target.value) })} />
            <Field label={t('editor.properties.color')}>
              <input type="color" value={element.color} onChange={(e) => set({ color: e.target.value })} className="h-9 w-full rounded-md border border-slate-300" />
            </Field>
          </div>
          <Field label={t('editor.stylePanel.align')}>
            <AlignPicker value={element.text_align} onChange={(value) => set({ text_align: value })} />
          </Field>
        </>
      )}

      {element.type === 'table' && (
        <>
          <TableColumnEditor element={element} onChange={(columns) => set({ columns })} />
          <div className="grid grid-cols-2 gap-2">
            <Input label={t('editor.table.headerFontSize')} type="number" value={element.header_font_size} onChange={(e) => set({ header_font_size: Number(e.target.value) })} />
            <Input label={t('editor.table.rowFontSize')} type="number" value={element.row_font_size} onChange={(e) => set({ row_font_size: Number(e.target.value) })} />
            <Field label={t('editor.table.headerBg')}>
              <input type="color" value={element.header_bg_color} onChange={(e) => set({ header_bg_color: e.target.value })} className="h-9 w-full rounded-md border border-slate-300" />
            </Field>
            <Field label={t('editor.table.borderColor')}>
              <input type="color" value={element.border_color} onChange={(e) => set({ border_color: e.target.value })} className="h-9 w-full rounded-md border border-slate-300" />
            </Field>
            <Input label={t('editor.table.rowHeight')} type="number" step={0.5} value={element.row_height_mm} onChange={(e) => set({ row_height_mm: Number(e.target.value) })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={element.zebra_striping} onChange={(e) => set({ zebra_striping: e.target.checked })} />
            {t('editor.table.zebraStriping')}
          </label>
        </>
      )}
    </div>
  )
}
