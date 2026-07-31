import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import type { FieldType } from '@/types/template'

const VALUE_TYPES: FieldType[] = ['text', 'number', 'date', 'currency']

interface CustomFieldPopoverProps {
  position: { top: number; left: number }
  onConfirm: (label: string, fieldType: FieldType) => void
  onCancel: () => void
}

export function CustomFieldPopover({ position, onConfirm, onCancel }: CustomFieldPopoverProps) {
  const { t } = useTranslation()
  const [label, setLabel] = useState('')
  const [fieldType, setFieldType] = useState<FieldType>('text')

  return (
    <div
      style={{ top: position.top, left: position.left }}
      className="fixed z-20 flex w-64 flex-col gap-3 rounded-md border border-slate-300 bg-white p-4 shadow-lg"
    >
      <h3 className="text-sm font-semibold text-slate-900">{t('editor.customFieldPopover.title')}</h3>

      <Input
        label={t('editor.customFieldPopover.labelField')}
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        autoFocus
      />

      <div>
        <span className="mb-1 block text-sm font-medium text-slate-700">
          {t('editor.customFieldPopover.valueType')}
        </span>
        <select
          value={fieldType}
          onChange={(event) => setFieldType(event.target.value as FieldType)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {VALUE_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`editor.customFieldPopover.valueTypes.${type}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          {t('editor.customFieldPopover.cancel')}
        </Button>
        <Button disabled={!label.trim()} onClick={() => onConfirm(label.trim(), fieldType)}>
          {t('editor.customFieldPopover.confirm')}
        </Button>
      </div>
    </div>
  )
}
