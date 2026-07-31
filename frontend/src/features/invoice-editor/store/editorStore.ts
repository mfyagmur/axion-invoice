import { create } from 'zustand'
import type { FieldMeta, LayoutFieldEntry, PageSize, TemplateDetail } from '@/types/template'

interface EditorState {
  templateId: string | null
  name: string
  pageSize: PageSize
  layoutEntries: LayoutFieldEntry[]
  fieldMeta: Record<string, FieldMeta>
  selectedFieldKey: string | null
  isFromSystemTemplate: boolean

  loadTemplate: (template: TemplateDetail) => void
  setName: (name: string) => void
  addField: (entry: LayoutFieldEntry, meta: FieldMeta) => void
  moveField: (fieldKey: string, xMm: number, yMm: number) => void
  updateFieldStyle: (
    fieldKey: string,
    patch: Partial<Pick<LayoutFieldEntry, 'font_size' | 'bold' | 'align'>>,
  ) => void
  selectField: (fieldKey: string | null) => void
  reset: () => void
}

const initialState = {
  templateId: null as string | null,
  name: '',
  pageSize: 'a4' as PageSize,
  layoutEntries: [] as LayoutFieldEntry[],
  fieldMeta: {} as Record<string, FieldMeta>,
  selectedFieldKey: null as string | null,
  isFromSystemTemplate: false,
}

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,

  loadTemplate: (template) =>
    set({
      templateId: template.id,
      name: template.name,
      pageSize: template.page_size,
      layoutEntries: template.layout_json,
      fieldMeta: Object.fromEntries(
        template.fields.map((field) => [
          field.field_key,
          {
            field_type: field.field_type,
            label: field.label,
            is_custom: field.is_custom,
            default_value: field.default_value ?? undefined,
          },
        ]),
      ),
      selectedFieldKey: null,
      isFromSystemTemplate: template.is_system_template,
    }),

  setName: (name) => set({ name }),

  addField: (entry, meta) =>
    set((state) => ({
      layoutEntries: [...state.layoutEntries, entry],
      fieldMeta: { ...state.fieldMeta, [entry.field_key]: meta },
      selectedFieldKey: entry.field_key,
    })),

  moveField: (fieldKey, xMm, yMm) =>
    set((state) => ({
      layoutEntries: state.layoutEntries.map((entry) =>
        entry.field_key === fieldKey ? { ...entry, x_mm: xMm, y_mm: yMm } : entry,
      ),
    })),

  updateFieldStyle: (fieldKey, patch) =>
    set((state) => ({
      layoutEntries: state.layoutEntries.map((entry) =>
        entry.field_key === fieldKey ? { ...entry, ...patch } : entry,
      ),
    })),

  selectField: (fieldKey) => set({ selectedFieldKey: fieldKey }),

  reset: () => set(initialState),
}))
