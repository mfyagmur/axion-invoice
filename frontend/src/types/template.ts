import type { CanvasElementData } from '@/features/invoice-editor/types/element'

export type FieldType = 'text' | 'number' | 'date' | 'currency' | 'custom'
export type Align = 'left' | 'center' | 'right'
export type PageSize = 'a4'
export type Orientation = 'portrait' | 'landscape'
export type TemplateEngine = 'visual' | 'xslt'
export type TemplateFormat = 'generic' | 'e_fatura' | 'international' | 'e_irsaliye_arsiv'

/** @deprecated layout_version=1 shape, kept only to read legacy templates. */
export interface LayoutFieldEntry {
  field_key: string
  x_mm: number
  y_mm: number
  width_mm: number
  height_mm: number
  font_size: number
  bold: boolean
  align: Align
}

export interface TemplateField {
  id: string
  field_key: string
  field_type: FieldType
  label: string
  is_custom: boolean
  default_value: string | null
  is_computed: boolean
}

export interface FieldMeta {
  field_type: FieldType
  label: string
  is_custom: boolean
  default_value?: string
}

export interface TemplateSummary {
  id: string
  name: string
  is_system_template: boolean
  is_active: boolean
  page_size: PageSize
  orientation: Orientation
  layout_version: number
  engine: TemplateEngine
  target_format: TemplateFormat
  min_plan_key: string | null
  updated_at: string
}

export interface TemplateDetail extends TemplateSummary {
  layout_json: LayoutFieldEntry[] | CanvasElementData[]
  fields: TemplateField[]
  xslt_content: string | null
}

export interface TemplateSavePayload {
  name: string
  page_size: PageSize
  orientation: Orientation
  layout_json: CanvasElementData[]
  fields: Record<string, FieldMeta>
}

export interface XsltTemplateSavePayload {
  name: string
  target_format: TemplateFormat
  xslt_content: string
  fields: Record<string, FieldMeta>
  min_plan_key?: string | null
}
