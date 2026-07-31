import type { FieldCatalogEntry } from '@/features/invoice-editor/constants/fieldCatalog'

export type PaletteDragData =
  | { type: 'placed-field'; fieldKey: string }
  | { type: 'palette-item'; catalogEntry: FieldCatalogEntry | null }
