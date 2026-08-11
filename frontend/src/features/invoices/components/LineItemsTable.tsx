import { useTranslation } from 'react-i18next'
import { Card } from '@/components/Card'
import { formatCurrency } from '@/utils/formatCurrency'
import type { LineItem } from '@/types/invoice'

interface LineItemsTableProps {
  lineItems: LineItem[]
  currency: string
  subtotal: string
  taxTotal: string
  grandTotal: string
}

export function LineItemsTable({ lineItems, currency, subtotal, taxTotal, grandTotal }: LineItemsTableProps) {
  const { t } = useTranslation()

  return (
    <Card title={t('invoices.form.lineItems')}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
              <th className="py-2 pr-3">{t('invoices.form.itemCode')}</th>
              <th className="py-2 pr-3">{t('invoices.form.description')}</th>
              <th className="py-2 pr-3 text-right">{t('invoices.form.quantity')}</th>
              <th className="py-2 pr-3 text-right">{t('invoices.form.unitPrice')}</th>
              <th className="py-2 pr-3 text-right">{t('invoices.form.taxRate')}</th>
              <th className="py-2 pr-3 text-right">{t('invoices.form.discountRate')}</th>
              <th className="py-2 text-right">{t('invoices.form.amount')}</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 text-slate-700">
                <td className="py-3 pr-3">{item.item_code || '—'}</td>
                <td className="py-3 pr-3">{item.description}</td>
                <td className="py-3 pr-3 text-right">{Number(item.quantity)}</td>
                <td className="py-3 pr-3 text-right">
                  {formatCurrency(item.unit_price)} {currency}
                </td>
                <td className="py-3 pr-3 text-right">%{Number(item.tax_rate)}</td>
                <td className="py-3 pr-3 text-right">%{Number(item.discount_rate)}</td>
                <td className="py-3 text-right font-semibold text-slate-900">
                  {formatCurrency(item.line_total)} {currency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-col items-end gap-1 border-t border-slate-200 pt-3 text-sm">
        <div className="flex w-48 justify-between">
          <span className="text-slate-500">{t('invoices.form.subtotal')}</span>
          <span className="text-slate-900">
            {formatCurrency(subtotal)} {currency}
          </span>
        </div>
        <div className="flex w-48 justify-between">
          <span className="text-slate-500">{t('invoices.form.tax')}</span>
          <span className="text-slate-900">
            {formatCurrency(taxTotal)} {currency}
          </span>
        </div>
        <div className="flex w-48 justify-between border-t border-slate-200 pt-1 font-semibold">
          <span className="text-slate-900">{t('invoices.form.grandTotal')}</span>
          <span className="text-slate-900">
            {formatCurrency(grandTotal)} {currency}
          </span>
        </div>
      </div>
    </Card>
  )
}
