import type { FieldCatalogEntry } from '@/features/invoice-editor/constants/fieldCatalog'
import type { ElementType } from '@/features/invoice-editor/types/element'

export type PaletteDragData =
  | { type: 'placed-element'; elementId: string }
  | { type: 'palette-field'; catalogEntry: FieldCatalogEntry }
  | { type: 'palette-element'; elementType: ElementType }
  | { type: 'palette-custom' }
