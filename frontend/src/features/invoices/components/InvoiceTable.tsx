import { useTranslation } from 'react-i18next'
import type { InvoiceRow } from '@/features/invoices/types/invoiceRow'
import { InvoiceTableRow } from './InvoiceTableRow'

interface InvoiceTableProps {
  rows: InvoiceRow[]
}

export function InvoiceTable({ rows }: InvoiceTableProps) {
  const { t } = useTranslation()

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
            <th className="px-4 py-3">{t('invoices.table.invoiceNo')}</th>
            <th className="px-4 py-3">{t('invoices.table.amount')}</th>
            <th className="px-4 py-3">{t('invoices.table.createdAt')}</th>
            <th className="px-4 py-3">{t('invoices.table.status')}</th>
            <th className="w-10 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                {t('invoices.list.empty')}
              </td>
            </tr>
          ) : (
            rows.map((row) => <InvoiceTableRow key={row.id} row={row} />)
          )}
        </tbody>
      </table>
    </div>
  )
}
