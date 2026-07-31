import { AlignCenter, AlignLeft, AlignRight, Bold } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { Input } from '@/components/Input'
import { useEditorStore } from '@/features/invoice-editor/store/editorStore'
import type { Align } from '@/types/template'

const ALIGN_OPTIONS: { value: Align; icon: typeof AlignLeft }[] = [
  { value: 'left', icon: AlignLeft },
  { value: 'center', icon: AlignCenter },
  { value: 'right', icon: AlignRight },
]

export function StylePanel() {
  const { t } = useTranslation()
  const selectedFieldKey = useEditorStore((state) => state.selectedFieldKey)
  const layoutEntries = useEditorStore((state) => state.layoutEntries)
  const fieldMeta = useEditorStore((state) => state.fieldMeta)
  const updateFieldStyle = useEditorStore((state) => state.updateFieldStyle)

  const selectedEntry = layoutEntries.find((entry) => entry.field_key === selectedFieldKey)

  if (!selectedEntry) {
    return (
      <div className="w-full text-sm text-slate-400 lg:w-56 lg:shrink-0">{t('editor.stylePanel.emptyState')}</div>
    )
  }

  const meta = fieldMeta[selectedEntry.field_key]

  return (
    <div className="flex w-full flex-col gap-4 lg:w-56 lg:shrink-0">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{t('editor.stylePanel.title')}</h2>
        <p className="text-xs text-slate-500">{meta?.label ?? selectedEntry.field_key}</p>
      </div>

      <Input
        label={t('editor.stylePanel.fontSize')}
        type="number"
        min={6}
        max={72}
        value={selectedEntry.font_size}
        onChange={(event) =>
          updateFieldStyle(selectedEntry.field_key, { font_size: Number(event.target.value) })
        }
      />

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={selectedEntry.bold}
          onChange={(event) => updateFieldStyle(selectedEntry.field_key, { bold: event.target.checked })}
        />
        <Bold size={16} />
        {t('editor.stylePanel.bold')}
      </label>

      <div>
        <span className="mb-1 block text-sm font-medium text-slate-700">{t('editor.stylePanel.align')}</span>
        <div className="flex gap-1">
          {ALIGN_OPTIONS.map(({ value, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => updateFieldStyle(selectedEntry.field_key, { align: value })}
              className={twMerge(
                'flex-1 rounded-md border border-slate-300 py-1.5 flex items-center justify-center hover:bg-slate-50',
                selectedEntry.align === value && 'border-slate-900 bg-slate-900 text-white hover:bg-slate-900',
              )}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
