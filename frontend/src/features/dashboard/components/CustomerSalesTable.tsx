import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/Card'
import { ErrorState } from '@/components/ErrorState'
import { formatCurrency } from '@/utils/formatCurrency'
import type { DashboardCharts } from '@/features/dashboard/types/dashboard'

interface CustomerSalesTableProps {
  data: DashboardCharts | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

function collectionRateColor(rate: number | null): string {
  if (rate === null) return 'bg-slate-300 dark:bg-slate-600'
  if (rate >= 80) return 'bg-green-500'
  if (rate >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}

export function CustomerSalesTable({ data, isLoading, isError, onRetry }: CustomerSalesTableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const rows = data?.customer_sales ?? []

  const totals = rows.reduce(
    (acc, row) => ({
      sales: acc.sales + Number(row.sales_try),
      paid: acc.paid + Number(row.paid_try),
      pending: acc.pending + Number(row.pending_try),
      invoiceCount: acc.invoiceCount + row.invoice_count,
    }),
    { sales: 0, paid: 0, pending: 0, invoiceCount: 0 },
  )
  const overallCollectionRate = totals.sales > 0 ? (totals.paid / totals.sales) * 100 : null

  return (
    <Card
      title={t('dashboard.demo.tables.customerSalesTable')}
      className="flex h-full flex-col"
    >
      {isError && <ErrorState onRetry={onRetry} />}
      {!isError && isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isError && !isLoading && rows.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.demo.charts.empty')}</p>
      )}
      {!isError && !isLoading && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-150 text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                <th className="px-3 py-2">{t('dashboard.demo.tables.customerName')}</th>
                <th className="px-3 py-2">{t('dashboard.demo.tables.salesTotal')}</th>
                <th className="px-3 py-2">{t('dashboard.demo.tables.invoiceCount')}</th>
                <th className="px-3 py-2">{t('dashboard.demo.tables.paidAmount')}</th>
                <th className="px-3 py-2">{t('dashboard.demo.tables.pendingAmount')}</th>
                <th className="px-3 py-2">{t('dashboard.demo.tables.collectionRate')}</th>
                <th className="px-3 py-2">{t('dashboard.demo.tables.salesShare')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => navigate(`/dashboard/customers/${row.id}`)}
                  className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                >
                  <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-slate-100">{row.name}</td>
                  <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{formatCurrency(row.sales_try)} ₺</td>
                  <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{row.invoice_count}</td>
                  <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{formatCurrency(row.paid_try)} ₺</td>
                  <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{formatCurrency(row.pending_try)} ₺</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${collectionRateColor(row.collection_rate_pct)}`} />
                      <span className="text-slate-700 dark:text-slate-300">
                        {row.collection_rate_pct === null ? '—' : `%${row.collection_rate_pct.toFixed(0)}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">
                    {row.sales_share_pct === null ? '—' : `%${row.sales_share_pct.toFixed(0)}`}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 bg-black text-sm font-semibold text-white dark:border-slate-700">
                <td className="px-3 py-2.5">{t('dashboard.demo.tables.grandTotal')}</td>
                <td className="px-3 py-2.5">{formatCurrency(totals.sales)} ₺</td>
                <td className="px-3 py-2.5">{totals.invoiceCount}</td>
                <td className="px-3 py-2.5">{formatCurrency(totals.paid)} ₺</td>
                <td className="px-3 py-2.5">{formatCurrency(totals.pending)} ₺</td>
                <td className="px-3 py-2.5">{overallCollectionRate === null ? '—' : `%${overallCollectionRate.toFixed(0)}`}</td>
                <td className="px-3 py-2.5">%100</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Card>
  )
}
