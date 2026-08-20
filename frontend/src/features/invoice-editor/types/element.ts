import type { Align } from '@/types/template'

export type ObjectFit = 'contain' | 'cover' | 'original'

interface BaseElement {
  id: string
  x_mm: number
  y_mm: number
  width_mm: number
  height_mm: number
  rotation: number
  z_index: number
  locked: boolean
  hidden: boolean
}

export interface TextElement extends BaseElement {
  type: 'text'
  content: string
  font_size: number
  font_family: string
  font_weight: 'normal' | 'bold'
  font_style: 'normal' | 'italic'
  color: string
  background_color: string | null
  text_align: Align
  line_height: number
  letter_spacing: number
}

export interface LineElement extends BaseElement {
  type: 'line'
  stroke_color: string
  stroke_width: number
}

export interface RectangleElement extends BaseElement {
  type: 'rectangle'
  fill_color: string | null
  border_color: string
  border_width: number
  border_radius: number
}

export interface LogoElement extends BaseElement {
  type: 'logo'
  object_fit: ObjectFit
}

export interface ImageElement extends BaseElement {
  type: 'image'
  src: string
  object_fit: ObjectFit
}

export interface QrCodeElement extends BaseElement {
  type: 'qrcode'
  data_source: 'invoice_number' | 'static'
  static_value: string | null
}

export interface SignatureElement extends BaseElement {
  type: 'signature'
  label: string
}

export interface DynamicFieldElement extends BaseElement {
  type: 'dynamic-field'
  field_key: string
  label: string
  font_size: number
  font_weight: 'normal' | 'bold'
  font_style: 'normal' | 'italic'
  color: string
  text_align: Align
  line_height: number
  letter_spacing: number
  is_custom: boolean
  default_value: string | null
}

export interface TableColumn {
  key: string
  label: string
  visible: boolean
  width_mm: number
  align: Align
}

export interface InvoiceTableElement extends BaseElement {
  type: 'table'
  columns: TableColumn[]
  header_font_size: number
  header_bg_color: string
  header_text_color: string
  row_font_size: number
  row_height_mm: number
  border_color: string
  border_width: number
  zebra_striping: boolean
  currency_format: string
  number_format: string
}

export interface BankAccountElement extends BaseElement {
  type: 'bank-account'
  slot: 1 | 2 | 3
  font_size: number
  text_align: Align
  color: string
}

export type CanvasElementData =
  | TextElement
  | LineElement
  | RectangleElement
  | LogoElement
  | ImageElement
  | QrCodeElement
  | SignatureElement
  | DynamicFieldElement
  | InvoiceTableElement
  | BankAccountElement

export type ElementType = CanvasElementData['type']

export const RESIZABLE_MIN_MM = 4
