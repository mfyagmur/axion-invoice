import type { CanvasElementData, DynamicFieldElement } from '@/features/invoice-editor/types/element'
import type { LayoutFieldEntry, TemplateField } from '@/types/template'

const LEGACY_KEY_MAP: Record<string, string> = {
  customer_name: 'customer.name',
  invoice_date: 'invoice.date',
  due_date: 'invoice.due_date',
  invoice_number: 'invoice.number',
  company_name: 'company.company_name',
  subtotal: 'totals.subtotal',
  tax: 'totals.tax',
  company_address: 'company.address',
  company_phone: 'company.phone',
  company_email: 'company.corporate_email',
  company_tax_office: 'company.tax_office',
  company_tax_number: 'company.tax_number',
}

/**
 * Converts a layout_version=1 template (a flat list of positioned field entries, each tied
 * to a single hardcoded field_key) into v2 DynamicFieldElement objects the new designer can
 * edit. Runs once when a legacy template is opened; saving writes it back as layout_version=2.
 */
export function legacyLayoutToElements(entries: LayoutFieldEntry[], fields: TemplateField[]): CanvasElementData[] {
  const fieldByKey = new Map(fields.map((field) => [field.field_key, field]))

  return entries.map((entry, index): DynamicFieldElement => {
    const meta = fieldByKey.get(entry.field_key)
    const mappedKey = LEGACY_KEY_MAP[entry.field_key] ?? entry.field_key
    return {
      id: `legacy_${entry.field_key}_${index}`,
      type: 'dynamic-field',
      x_mm: entry.x_mm,
      y_mm: entry.y_mm,
      width_mm: entry.width_mm,
      height_mm: entry.height_mm,
      rotation: 0,
      z_index: index,
      locked: false,
      hidden: false,
      field_key: mappedKey,
      label: meta?.label ?? entry.field_key,
      font_size: entry.font_size,
      font_weight: entry.bold ? 'bold' : 'normal',
      font_style: 'normal',
      color: '#1a1a1a',
      text_align: entry.align,
      line_height: 1.3,
      letter_spacing: 0,
      is_custom: meta?.is_custom ?? mappedKey === entry.field_key,
      default_value: meta?.default_value ?? null,
    }
  })
}
