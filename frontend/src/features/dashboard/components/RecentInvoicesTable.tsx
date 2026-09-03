import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/Card'
import { InvoiceStatusBadge } from '@/features/invoices/components/InvoiceStatusBadge'
import { formatCurrency } from '@/utils/formatCurrency'
import { useDateFormat } from '@/hooks/useDateFormat'
import type { InvoiceSummary } from '@/types/invoice'

interface RecentInvoicesTableProps {
  invoices: InvoiceSummary[]
}

export function RecentInvoicesTable({ invoices }: RecentInvoicesTableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { formatDateVerbal } = useDateFormat()

  return (
    <Card
      title={t('dashboard.demo.tables.recentInvoices')}
      subtitle={t('dashboard.demo.tables.recentInvoicesSubtitle')}
      className="h-full"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-150 text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <th className="px-3 py-2">{t('dashboard.demo.tables.invoiceNo')}</th>
              <th className="px-3 py-2">{t('dashboard.demo.tables.customerName')}</th>
              <th className="px-3 py-2">{t('dashboard.demo.tables.date')}</th>
              <th className="px-3 py-2">{t('dashboard.demo.tables.amount')}</th>
              <th className="px-3 py-2">{t('dashboard.demo.tables.status')}</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  {t('invoices.list.empty')}
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  onClick={() => navigate(`/dashboard/invoices/${invoice.id}`)}
                  className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                >
                  <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-slate-100">{invoice.invoice_number}</td>
                  <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{invoice.customer.name}</td>
                  <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">
                    {formatDateVerbal(invoice.issued_at ?? invoice.created_at, { month: 'short' })}
                  </td>
                  <td className="px-3 py-2.5 text-slate-900 dark:text-slate-100">
                    {formatCurrency(invoice.grand_total)} {invoice.currency}
                  </td>
                  <td className="px-3 py-2.5">
                    <InvoiceStatusBadge status={invoice.display_status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
