import type { FieldType } from '@/types/template'

export interface FieldCatalogEntry {
  field_key: string
  labelKey: string
  field_type: FieldType
  default_width_mm: number
  default_height_mm: number
  default_font_size: number
}

export interface FieldCatalogCategory {
  categoryKey: string
  entries: FieldCatalogEntry[]
}

/**
 * Mirrors the field namespaces `backend/app/services/template_field_resolver.py` resolves
 * (`invoice.*`, `company.*`, `customer.*`, `recipient.contact_N.*`, `payment.bank_account_N.*`,
 * `totals.*`) and the sections of `dashboard/invoices/new` (`InvoiceForm.tsx`) they come from,
 * so every field the invoice creation form collects can be placed on the template canvas.
 */
export const FIELD_CATALOG: FieldCatalogCategory[] = [
  {
    categoryKey: 'invoice',
    entries: [
      { field_key: 'invoice.number', labelKey: 'editor.field.invoice_number', field_type: 'text', default_width_mm: 40, default_height_mm: 6, default_font_size: 10 },
      { field_key: 'invoice.date', labelKey: 'editor.field.invoice_date', field_type: 'date', default_width_mm: 30, default_height_mm: 6, default_font_size: 10 },
      { field_key: 'invoice.due_date', labelKey: 'editor.field.due_date', field_type: 'date', default_width_mm: 30, default_height_mm: 6, default_font_size: 10 },
      { field_key: 'invoice.currency', labelKey: 'editor.field.invoice_currency', field_type: 'text', default_width_mm: 20, default_height_mm: 6, default_font_size: 10 },
      { field_key: 'invoice.payment_currency', labelKey: 'editor.field.payment_currency', field_type: 'text', default_width_mm: 20, default_height_mm: 6, default_font_size: 10 },
      { field_key: 'invoice.exchange_rate', labelKey: 'editor.field.exchange_rate', field_type: 'number', default_width_mm: 25, default_height_mm: 6, default_font_size: 10 },
      { field_key: 'invoice.type', labelKey: 'editor.field.invoice_type', field_type: 'text', default_width_mm: 30, default_height_mm: 6, default_font_size: 10 },
      { field_key: 'invoice.scenario', labelKey: 'editor.field.scenario', field_type: 'text', default_width_mm: 30, default_height_mm: 6, default_font_size: 10 },
      { field_key: 'invoice.notes', labelKey: 'editor.field.notes', field_type: 'text', default_width_mm: 120, default_height_mm: 16, default_font_size: 9 },
    ],
  },
  {
    categoryKey: 'company',
    entries: [
      { field_key: 'company.company_name', labelKey: 'editor.field.company_name', field_type: 'text', default_width_mm: 70, default_height_mm: 10, default_font_size: 14 },
      { field_key: 'company.tax_office', labelKey: 'editor.field.company_tax_office', field_type: 'text', default_width_mm: 60, default_height_mm: 6, default_font_size: 9 },
      { field_key: 'company.tax_number', labelKey: 'editor.field.company_tax_number', field_type: 'text', default_width_mm: 40, default_height_mm: 6, default_font_size: 9 },
      { field_key: 'company.address', labelKey: 'editor.field.company_address', field_type: 'text', default_width_mm: 80, default_height_mm: 8, default_font_size: 10 },
      { field_key: 'company.city', labelKey: 'editor.field.company_city', field_type: 'text', default_width_mm: 40, default_height_mm: 6, default_font_size: 9 },
      { field_key: 'company.postal_code', labelKey: 'editor.field.company_postal_code', field_type: 'text', default_width_mm: 25, default_height_mm: 6, default_font_size: 9 },
      { field_key: 'company.country', labelKey: 'editor.field.company_country', field_type: 'text', default_width_mm: 40, default_height_mm: 6, default_font_size: 9 },
      { field_key: 'company.phone', labelKey: 'editor.field.company_phone', field_type: 'text', default_width_mm: 50, default_height_mm: 6, default_font_size: 9 },
      { field_key: 'company.corporate_email', labelKey: 'editor.field.company_email', field_type: 'text', default_width_mm: 60, default_height_mm: 6, default_font_size: 9 },
      { field_key: 'company.sector', labelKey: 'editor.field.company_sector', field_type: 'text', default_width_mm: 50, default_height_mm: 6, default_font_size: 9 },
      { field_key: 'company.trade_registry_no', labelKey: 'editor.field.company_trade_registry_no', field_type: 'text', default_width_mm: 50, default_height_mm: 6, default_font_size: 9 },
    ],
  },
  {
    categoryKey: 'customer',
    entries: [
      { field_key: 'customer.name', labelKey: 'editor.field.customer_name', field_type: 'text', default_width_mm: 60, default_height_mm: 8, default_font_size: 11 },
      { field_key: 'customer.tax_office', labelKey: 'editor.field.customer_tax_office', field_type: 'text', default_width_mm: 60, default_height_mm: 6, default_font_size: 9 },
      { field_key: 'customer.tax_number', labelKey: 'editor.field.customer_tax_number', field_type: 'text', default_width_mm: 40, default_height_mm: 6, default_font_size: 9 },
      { field_key: 'customer.address', labelKey: 'editor.field.customer_address', field_type: 'text', default_width_mm: 80, default_height_mm: 8, default_font_size: 10 },
      { field_key: 'customer.city', labelKey: 'editor.field.customer_city', field_type: 'text', default_width_mm: 40, default_height_mm: 6, default_font_size: 9 },
      { field_key: 'customer.postal_code', labelKey: 'editor.field.customer_postal_code', field_type: 'text', default_width_mm: 25, default_height_mm: 6, default_font_size: 9 },
      { field_key: 'customer.country', labelKey: 'editor.field.customer_country', field_type: 'text', default_width_mm: 40, default_height_mm: 6, default_font_size: 9 },
      { field_key: 'customer.email', labelKey: 'editor.field.customer_email', field_type: 'text', default_width_mm: 60, default_height_mm: 6, default_font_size: 9 },
      { field_key: 'customer.phone', labelKey: 'editor.field.customer_phone', field_type: 'text', default_width_mm: 50, default_height_mm: 6, default_font_size: 9 },
      { field_key: 'customer.fax', labelKey: 'editor.field.customer_fax', field_type: 'text', default_width_mm: 40, default_height_mm: 6, default_font_size: 9 },
      { field_key: 'customer.website', labelKey: 'editor.field.customer_website', field_type: 'text', default_width_mm: 50, default_height_mm: 6, default_font_size: 9 },
      { field_key: 'customer.mersis_no', labelKey: 'editor.field.customer_mersis_no', field_type: 'text', default_width_mm: 40, default_height_mm: 6, default_font_size: 9 },
      { field_key: 'recipient.contact_1.name', labelKey: 'editor.field.recipient_contact_1_name', field_type: 'text', default_width_mm: 50, default_height_mm: 6, default_font_size: 9 },
      { field_key: 'recipient.contact_1.email', labelKey: 'editor.field.recipient_contact_1_email', field_type: 'text', default_width_mm: 55, default_height_mm: 6, default_font_size: 9 },
      { field_key: 'recipient.contact_1.phone', labelKey: 'editor.field.recipient_contact_1_phone', field_type: 'text', default_width_mm: 45, default_height_mm: 6, default_font_size: 9 },
    ],
  },
  {
    categoryKey: 'totals',
    entries: [
      { field_key: 'totals.subtotal', labelKey: 'editor.field.subtotal', field_type: 'currency', default_width_mm: 35, default_height_mm: 6, default_font_size: 10 },
      { field_key: 'totals.discount', labelKey: 'editor.field.discount', field_type: 'currency', default_width_mm: 35, default_height_mm: 6, default_font_size: 10 },
      { field_key: 'totals.tax', labelKey: 'editor.field.tax', field_type: 'currency', default_width_mm: 35, default_height_mm: 6, default_font_size: 10 },
      { field_key: 'totals.other_tax', labelKey: 'editor.field.other_tax', field_type: 'currency', default_width_mm: 35, default_height_mm: 6, default_font_size: 10 },
      { field_key: 'totals.grand_total', labelKey: 'editor.field.grand_total', field_type: 'currency', default_width_mm: 35, default_height_mm: 7, default_font_size: 12 },
      { field_key: 'totals.net_receivable', labelKey: 'editor.field.net_receivable', field_type: 'currency', default_width_mm: 35, default_height_mm: 6, default_font_size: 10 },
    ],
  },
]

export const ALL_FIELD_CATALOG_ENTRIES: FieldCatalogEntry[] = FIELD_CATALOG.flatMap((category) => category.entries)

export function findCatalogEntry(fieldKey: string): FieldCatalogEntry | undefined {
  return ALL_FIELD_CATALOG_ENTRIES.find((entry) => entry.field_key === fieldKey)
}

export const CUSTOM_FIELD_PALETTE_KEY = '__custom__'

export const DEFAULT_TABLE_COLUMNS = [
  { key: 'item_code', labelKey: 'editor.tableColumn.item_code', default_width_mm: 20 },
  { key: 'description', labelKey: 'editor.tableColumn.description', default_width_mm: 55 },
  { key: 'quantity', labelKey: 'editor.tableColumn.quantity', default_width_mm: 15 },
  { key: 'unit', labelKey: 'editor.tableColumn.unit', default_width_mm: 15 },
  { key: 'unit_price', labelKey: 'editor.tableColumn.unit_price', default_width_mm: 20 },
  { key: 'discount_rate', labelKey: 'editor.tableColumn.discount_rate', default_width_mm: 15 },
  { key: 'tax_rate', labelKey: 'editor.tableColumn.tax_rate', default_width_mm: 15 },
  { key: 'other_tax_amount', labelKey: 'editor.tableColumn.other_tax_amount', default_width_mm: 20 },
  { key: 'line_total', labelKey: 'editor.tableColumn.line_total', default_width_mm: 25 },
] as const
