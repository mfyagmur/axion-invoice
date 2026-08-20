import type { CanvasElementData, ElementType } from '@/features/invoice-editor/types/element'
import { DEFAULT_TABLE_COLUMNS } from '@/features/invoice-editor/constants/fieldCatalog'

export function generateElementId(): string {
  return `el_${crypto.randomUUID().slice(0, 8)}`
}

const BASE = {
  rotation: 0,
  z_index: 0,
  locked: false,
  hidden: false,
}

export function createDefaultElement(type: ElementType, x_mm: number, y_mm: number, zIndex: number): CanvasElementData {
  const id = generateElementId()
  switch (type) {
    case 'text':
      return {
        id, type, x_mm, y_mm, width_mm: 60, height_mm: 8, ...BASE, z_index: zIndex,
        content: '', font_size: 11, font_family: 'Arial, Helvetica, sans-serif', font_weight: 'normal',
        font_style: 'normal', color: '#1a1a1a', background_color: null, text_align: 'left',
        line_height: 1.3, letter_spacing: 0,
      }
    case 'line':
      return { id, type, x_mm, y_mm, width_mm: 80, height_mm: 1, ...BASE, z_index: zIndex, stroke_color: '#333333', stroke_width: 0.3 }
    case 'rectangle':
      return { id, type, x_mm, y_mm, width_mm: 60, height_mm: 30, ...BASE, z_index: zIndex, fill_color: null, border_color: '#333333', border_width: 0.3, border_radius: 0 }
    case 'logo':
      return { id, type, x_mm, y_mm, width_mm: 40, height_mm: 20, ...BASE, z_index: zIndex, object_fit: 'contain' }
    case 'image':
      return { id, type, x_mm, y_mm, width_mm: 40, height_mm: 30, ...BASE, z_index: zIndex, src: '', object_fit: 'contain' }
    case 'qrcode':
      return { id, type, x_mm, y_mm, width_mm: 25, height_mm: 25, ...BASE, z_index: zIndex, data_source: 'invoice_number', static_value: null }
    case 'signature':
      return { id, type, x_mm, y_mm, width_mm: 50, height_mm: 16, ...BASE, z_index: zIndex, label: 'İmza' }
    case 'table':
      return {
        id, type, x_mm, y_mm, width_mm: 180, height_mm: 60, ...BASE, z_index: zIndex,
        columns: DEFAULT_TABLE_COLUMNS.map((c) => ({ key: c.key, label: c.key, visible: true, width_mm: c.default_width_mm, align: 'left' as const })),
        header_font_size: 8, header_bg_color: '#f1f5f9', header_text_color: '#1a1a1a',
        row_font_size: 8, row_height_mm: 6, border_color: '#cccccc', border_width: 0.2,
        zebra_striping: false, currency_format: '#,##0.00', number_format: '#,##0.##',
      }
    case 'bank-account':
      return { id, type, x_mm, y_mm, width_mm: 60, height_mm: 16, ...BASE, z_index: zIndex, slot: 1, font_size: 8, text_align: 'left', color: '#1a1a1a' }
    case 'dynamic-field':
      return {
        id, type, x_mm, y_mm, width_mm: 40, height_mm: 8, ...BASE, z_index: zIndex,
        field_key: '', label: '', font_size: 10, font_weight: 'normal', font_style: 'normal',
        color: '#1a1a1a', text_align: 'left', line_height: 1.3, letter_spacing: 0,
        is_custom: false, default_value: null,
      }
  }
}

export const BASIC_ELEMENT_TYPES: ElementType[] = ['text', 'line', 'rectangle']
export const VISUAL_ELEMENT_TYPES: ElementType[] = ['logo', 'image', 'qrcode', 'signature']
export const INVOICE_ELEMENT_TYPES: ElementType[] = ['table', 'bank-account']
