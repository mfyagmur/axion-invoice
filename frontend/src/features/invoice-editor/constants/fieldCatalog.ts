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
  {
    field_key: 'company_address',
    labelKey: 'editor.field.company_address',
    field_type: 'text',
    default_width_mm: 80,
    default_height_mm: 8,
    default_font_size: 10,
  },
  {
    field_key: 'company_phone',
    labelKey: 'editor.field.company_phone',
    field_type: 'text',
    default_width_mm: 50,
    default_height_mm: 6,
    default_font_size: 9,
  },
  {
    field_key: 'company_email',
    labelKey: 'editor.field.company_email',
    field_type: 'text',
    default_width_mm: 60,
    default_height_mm: 6,
    default_font_size: 9,
  },
  {
    field_key: 'company_tax_office',
    labelKey: 'editor.field.company_tax_office',
    field_type: 'text',
    default_width_mm: 60,
    default_height_mm: 6,
    default_font_size: 9,
  },
  {
    field_key: 'company_tax_number',
    labelKey: 'editor.field.company_tax_number',
    field_type: 'text',
    default_width_mm: 40,
    default_height_mm: 6,
    default_font_size: 9,
  },
]

export const CUSTOM_FIELD_PALETTE_KEY = '__custom__'
