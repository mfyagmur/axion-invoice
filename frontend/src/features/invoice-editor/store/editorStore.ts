import { create } from 'zustand'
import type { CanvasElementData } from '@/features/invoice-editor/types/element'
import { legacyLayoutToElements } from '@/features/invoice-editor/utils/legacyLayoutAdapter'
import type { FieldMeta, Orientation, PageSize, TemplateDetail } from '@/types/template'

const MAX_HISTORY = 50

interface EditorState {
  templateId: string | null
  name: string
  pageSize: PageSize
  orientation: Orientation
  elements: CanvasElementData[]
  fieldMeta: Record<string, FieldMeta>
  selectedIds: string[]
  isFromSystemTemplate: boolean

  past: CanvasElementData[][]
  future: CanvasElementData[][]

  loadTemplate: (template: TemplateDetail) => void
  setName: (name: string) => void
  setOrientation: (orientation: Orientation) => void

  addElement: (element: CanvasElementData, meta?: { field_key: string; meta: FieldMeta }) => void
  addElements: (elements: CanvasElementData[]) => void
  removeElements: (ids: string[]) => void
  duplicateElements: (ids: string[]) => void

  updateElementLive: (id: string, patch: Partial<CanvasElementData>) => void
  updateElementsLive: (patches: Record<string, Partial<CanvasElementData>>) => void
  updateElement: (id: string, patch: Partial<CanvasElementData>) => void
  setFieldMeta: (fieldKey: string, meta: FieldMeta) => void

  bringToFront: (id: string) => void
  sendToBack: (id: string) => void
  moveLayerUp: (id: string) => void
  moveLayerDown: (id: string) => void
  reorderLayers: (orderedIds: string[]) => void
  toggleLock: (id: string) => void
  toggleHidden: (id: string) => void

  selectOnly: (id: string | null) => void
  selectAdd: (id: string) => void
  selectMany: (ids: string[]) => void
  clearSelection: () => void

  commit: () => void
  undo: () => void
  redo: () => void

  reset: () => void
}

const initialState = {
  templateId: null as string | null,
  name: '',
  pageSize: 'a4' as PageSize,
  orientation: 'portrait' as Orientation,
  elements: [] as CanvasElementData[],
  fieldMeta: {} as Record<string, FieldMeta>,
  selectedIds: [] as string[],
  isFromSystemTemplate: false,
  past: [] as CanvasElementData[][],
  future: [] as CanvasElementData[][],
}

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initialState,

  loadTemplate: (template) => {
    const isLegacy = template.layout_version < 2
    const elements = isLegacy
      ? legacyLayoutToElements(template.layout_json as never, template.fields)
      : (template.layout_json as CanvasElementData[])

    set({
      templateId: template.id,
      name: template.name,
      pageSize: template.page_size,
      orientation: template.orientation,
      elements,
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
      selectedIds: [],
      isFromSystemTemplate: template.is_system_template,
      past: [],
      future: [],
    })
  },

  setName: (name) => set({ name }),
  setOrientation: (orientation) => set({ orientation }),

  addElement: (element, dynamicField) =>
    set((state) => ({
      past: [...state.past, state.elements].slice(-MAX_HISTORY),
      future: [],
      elements: [...state.elements, element],
      fieldMeta: dynamicField ? { ...state.fieldMeta, [dynamicField.field_key]: dynamicField.meta } : state.fieldMeta,
      selectedIds: [element.id],
    })),

  addElements: (elements) =>
    set((state) => ({
      past: [...state.past, state.elements].slice(-MAX_HISTORY),
      future: [],
      elements: [...state.elements, ...elements],
      selectedIds: elements.map((el) => el.id),
    })),

  removeElements: (ids) =>
    set((state) => ({
      past: [...state.past, state.elements].slice(-MAX_HISTORY),
      future: [],
      elements: state.elements.filter((el) => !ids.includes(el.id)),
      selectedIds: state.selectedIds.filter((id) => !ids.includes(id)),
    })),

  duplicateElements: (ids) =>
    set((state) => {
      const clones = state.elements
        .filter((el) => ids.includes(el.id))
        .map((el) => ({
          ...el,
          id: `el_${crypto.randomUUID().slice(0, 8)}`,
          x_mm: el.x_mm + 5,
          y_mm: el.y_mm + 5,
          z_index: state.elements.length,
        }))
      return {
        past: [...state.past, state.elements].slice(-MAX_HISTORY),
        future: [],
        elements: [...state.elements, ...clones],
        selectedIds: clones.map((c) => c.id),
      }
    }),

  updateElementLive: (id, patch) =>
    set((state) => ({
      elements: state.elements.map((el) => (el.id === id ? ({ ...el, ...patch } as CanvasElementData) : el)),
    })),

  updateElementsLive: (patches) =>
    set((state) => ({
      elements: state.elements.map((el) => (patches[el.id] ? ({ ...el, ...patches[el.id] } as CanvasElementData) : el)),
    })),

  updateElement: (id, patch) =>
    set((state) => ({
      past: [...state.past, state.elements].slice(-MAX_HISTORY),
      future: [],
      elements: state.elements.map((el) => (el.id === id ? ({ ...el, ...patch } as CanvasElementData) : el)),
    })),

  setFieldMeta: (fieldKey, meta) => set((state) => ({ fieldMeta: { ...state.fieldMeta, [fieldKey]: meta } })),

  bringToFront: (id) =>
    set((state) => {
      const maxZ = Math.max(0, ...state.elements.map((el) => el.z_index))
      return {
        past: [...state.past, state.elements].slice(-MAX_HISTORY),
        future: [],
        elements: state.elements.map((el) => (el.id === id ? { ...el, z_index: maxZ + 1 } : el)),
      }
    }),

  sendToBack: (id) =>
    set((state) => {
      const minZ = Math.min(0, ...state.elements.map((el) => el.z_index))
      return {
        past: [...state.past, state.elements].slice(-MAX_HISTORY),
        future: [],
        elements: state.elements.map((el) => (el.id === id ? { ...el, z_index: minZ - 1 } : el)),
      }
    }),

  moveLayerUp: (id) =>
    set((state) => {
      const sorted = [...state.elements].sort((a, b) => a.z_index - b.z_index)
      const index = sorted.findIndex((el) => el.id === id)
      if (index === -1 || index === sorted.length - 1) return state
      const swapZ = sorted[index + 1].z_index
      sorted[index + 1] = { ...sorted[index + 1], z_index: sorted[index].z_index }
      sorted[index] = { ...sorted[index], z_index: swapZ }
      return { past: [...state.past, state.elements].slice(-MAX_HISTORY), future: [], elements: sorted }
    }),

  moveLayerDown: (id) =>
    set((state) => {
      const sorted = [...state.elements].sort((a, b) => a.z_index - b.z_index)
      const index = sorted.findIndex((el) => el.id === id)
      if (index <= 0) return state
      const swapZ = sorted[index - 1].z_index
      sorted[index - 1] = { ...sorted[index - 1], z_index: sorted[index].z_index }
      sorted[index] = { ...sorted[index], z_index: swapZ }
      return { past: [...state.past, state.elements].slice(-MAX_HISTORY), future: [], elements: sorted }
    }),

  reorderLayers: (orderedIds) =>
    set((state) => {
      // orderedIds is top-to-bottom (highest z first); convert to ascending z_index values.
      const total = orderedIds.length
      const zById = new Map(orderedIds.map((id, index) => [id, total - index]))
      return {
        past: [...state.past, state.elements].slice(-MAX_HISTORY),
        future: [],
        elements: state.elements.map((el) => (zById.has(el.id) ? { ...el, z_index: zById.get(el.id)! } : el)),
      }
    }),

  toggleLock: (id) =>
    set((state) => ({
      elements: state.elements.map((el) => (el.id === id ? { ...el, locked: !el.locked } : el)),
    })),

  toggleHidden: (id) =>
    set((state) => ({
      elements: state.elements.map((el) => (el.id === id ? { ...el, hidden: !el.hidden } : el)),
    })),

  selectOnly: (id) => set({ selectedIds: id ? [id] : [] }),
  selectAdd: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id) ? state.selectedIds : [...state.selectedIds, id],
    })),
  selectMany: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),

  commit: () => set((state) => ({ past: [...state.past, state.elements].slice(-MAX_HISTORY), future: [] })),

  undo: () => {
    const state = get()
    const previous = state.past[state.past.length - 1]
    if (!previous) return
    set({
      past: state.past.slice(0, -1),
      future: [state.elements, ...state.future].slice(0, MAX_HISTORY),
      elements: previous,
    })
  },

  redo: () => {
    const state = get()
    const next = state.future[0]
    if (!next) return
    set({
      past: [...state.past, state.elements].slice(-MAX_HISTORY),
      future: state.future.slice(1),
      elements: next,
    })
  },

  reset: () => set(initialState),
}))
