import { useTranslation } from 'react-i18next'
import type { InvoiceStatus } from '@/types/invoice'
import { Badge } from '@/components/Badge'
import { INVOICE_STATUS_BADGE_COLOR } from '@/features/invoices/utils/invoiceStatusBadge'

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const { t } = useTranslation()
  return (
    <Badge color={INVOICE_STATUS_BADGE_COLOR[status]}>
      {t(`invoices.status.${status}`)}
    </Badge>
  )
}
