import { useTranslation } from 'react-i18next'
import { Card } from '@/components/Card'
import type { InvoiceRow } from '@/features/invoices/types/invoiceRow'

interface NetReceivableBoxProps {
  row: InvoiceRow
}

export function NetReceivableBox({ row }: NetReceivableBoxProps) {
  const { t } = useTranslation()
  const headline = row.secondaryAmount ?? `${row.amount} ${row.currency}`

  return (
    <Card className="border-blue-100 bg-blue-50">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-blue-800">{t('invoices.detail.netReceivableLabel')}</span>
        <span className="text-lg font-semibold text-blue-900">{headline}</span>
        <p className="mt-2 text-xs text-blue-700">{t('invoices.detail.exchangeRateNote')}</p>
        {/* TODO: komisyon hesaplaması eklenince buraya gelecek */}
      </div>
    </Card>
  )
}
