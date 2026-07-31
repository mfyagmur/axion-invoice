import type { FieldType } from '@/types/template'

export interface FieldCatalogEntry {
  field_key: string
  labelKey: string
  field_type: FieldType
  default_width_mm: number
  default_height_mm: number
  default_font_size: number
}

export const BUILTIN_FIELD_CATALOG: FieldCatalogEntry[] = [
  {
    field_key: 'customer_name',
    labelKey: 'editor.field.customer_name',
    field_type: 'text',
    default_width_mm: 60,
    default_height_mm: 8,
    default_font_size: 11,
  },
  {
    field_key: 'invoice_date',
    labelKey: 'editor.field.invoice_date',
    field_type: 'date',
    default_width_mm: 30,
    default_height_mm: 6,
    default_font_size: 10,
  },
  {
    field_key: 'due_date',
    labelKey: 'editor.field.due_date',
    field_type: 'date',
    default_width_mm: 30,
    default_height_mm: 6,
    default_font_size: 10,
  },
  {
    field_key: 'invoice_number',
    labelKey: 'editor.field.invoice_number',
    field_type: 'text',
    default_width_mm: 40,
    default_height_mm: 6,
    default_font_size: 10,
  },
  {
    field_key: 'company_name',
    labelKey: 'editor.field.company_name',
    field_type: 'text',
    default_width_mm: 70,
    default_height_mm: 10,
    default_font_size: 14,
  },
  {
    field_key: 'subtotal',
    labelKey: 'editor.field.subtotal',
    field_type: 'currency',
    default_width_mm: 35,
    default_height_mm: 6,
    default_font_size: 10,
  },
  {
    field_key: 'tax',
    labelKey: 'editor.field.tax',
    field_type: 'currency',
    default_width_mm: 35,
    default_height_mm: 6,
    default_font_size: 10,
  },
]

export const CUSTOM_FIELD_PALETTE_KEY = '__custom__'
