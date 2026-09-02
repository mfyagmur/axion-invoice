import type { InvoiceDisplayStatus } from '@/types/invoice'
import type { BadgeProps } from '@/components/Badge'

export const INVOICE_STATUS_BADGE_COLOR: Record<InvoiceDisplayStatus, NonNullable<BadgeProps['color']>> = {
  draft: 'slate',
  sent: 'blue',
  paid: 'green',
  overdue: 'red',
  cancelled: 'slate',
  archived: 'amber',
}
