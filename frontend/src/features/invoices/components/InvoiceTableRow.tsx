import { ExternalLink, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { InvoiceRow } from '@/features/invoices/types/invoiceRow'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'
import { InvoiceRowActions } from './InvoiceRowActions'

interface InvoiceTableRowProps {
  row: InvoiceRow
}

export function InvoiceTableRow({ row }: InvoiceTableRowProps) {
  const formattedDate = new Date(row.createdAt).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <FileText size={16} />
          </span>
          <div className="flex flex-col">
            <Link
              to={`/dashboard/invoices/${row.id}`}
              className="flex items-center gap-1 font-medium text-slate-900 hover:underline"
            >
              {row.invoiceNumber}
              <ExternalLink size={12} className="text-slate-400" />
            </Link>
            <span className="text-xs text-slate-500">{row.customerName}</span>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 align-top">
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">
            {row.amount} {row.currency}
          </span>
          {row.secondaryAmount && <span className="text-xs text-slate-500">{row.secondaryAmount}</span>}
        </div>
      </td>

      <td className="px-4 py-3 align-top">
        <div className="flex flex-col">
          <span className="text-slate-900">{formattedDate}</span>
          {row.customerEmail && <span className="text-xs text-slate-500">{row.customerEmail}</span>}
        </div>
      </td>

      <td className="px-4 py-3 align-top">
        <InvoiceStatusBadge status={row.status} />
      </td>

      <td className="px-4 py-3 align-top">
        <InvoiceRowActions invoiceId={row.id} />
      </td>
    </tr>
  )
}
