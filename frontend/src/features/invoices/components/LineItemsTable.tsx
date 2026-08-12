import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { EditIconButton } from '@/features/invoices/components/EditIconButton'
import { useUpdateInvoice } from '@/features/invoices/hooks/useUpdateInvoice'
import { formatCurrency } from '@/utils/formatCurrency'
import type { InvoiceStatus, LineItem, LineItemPayload } from '@/types/invoice'

interface LineItemsTableProps {
  invoiceId: string
  status: InvoiceStatus
  lineItems: LineItem[]
  currency: string
  subtotal: string
  taxTotal: string
  grandTotal: string
}

interface EditableRow {
  key: string
  item_code: string
  description: string
  quantity: string
  unit_price: string
  unit: string
  discount_rate: string
  tax_rate: string
  other_tax_amount: string
}

let rowKeySeq = 0
const nextRowKey = () => `row-${rowKeySeq++}`

function toEditableRow(item: LineItem): EditableRow {
  return {
    key: item.id,
    item_code: item.item_code ?? '',
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    unit: item.unit,
    discount_rate: item.discount_rate,
    tax_rate: item.tax_rate,
    other_tax_amount: item.other_tax_amount,
  }
}

function emptyRow(): EditableRow {
  return {
    key: nextRowKey(),
    item_code: '',
    description: '',
    quantity: '1',
    unit_price: '0',
    unit: 'adet',
    discount_rate: '0',
    tax_rate: '0',
    other_tax_amount: '0',
  }
}

export function LineItemsTable({
  invoiceId,
  status,
  lineItems,
  currency,
  subtotal,
  taxTotal,
  grandTotal,
}: LineItemsTableProps) {
  const { t } = useTranslation()
  const updateInvoice = useUpdateInvoice()
  const [isEditing, setIsEditing] = useState(false)
  const [rows, setRows] = useState<EditableRow[]>([])

  const canEdit = status === 'draft'

  const startEditing = () => {
    setRows(lineItems.map(toEditableRow))
    setIsEditing(true)
  }

  const updateRow = (key: string, field: keyof EditableRow, value: string) => {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, [field]: value } : row)))
  }

  const removeRow = (key: string) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((row) => row.key !== key) : prev))
  }

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow()])
  }

  const isValid = rows.every(
    (row) => row.description.trim().length > 0 && Number(row.quantity) > 0 && Number(row.unit_price) >= 0,
  )

  const handleSave = () => {
    if (!isValid) return
    const payload: LineItemPayload[] = rows.map((row) => ({
      item_code: row.item_code || undefined,
      description: row.description,
      quantity: Number(row.quantity),
      unit_price: Number(row.unit_price),
      unit: row.unit,
      discount_rate: Number(row.discount_rate),
      tax_rate: Number(row.tax_rate),
      other_tax_amount: Number(row.other_tax_amount),
    }))
    updateInvoice.mutate({ id: invoiceId, payload: { line_items: payload } }, { onSuccess: () => setIsEditing(false) })
  }

  const action = !canEdit ? null : isEditing ? (
    <div className="flex items-center gap-2">
      <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} disabled={updateInvoice.isPending}>
        {t('common.cancel')}
      </Button>
      <Button type="button" onClick={handleSave} disabled={updateInvoice.isPending || !isValid}>
        {t('common.save')}
      </Button>
    </div>
  ) : (
    <EditIconButton onClick={startEditing} />
  )

  return (
    <Card title={t('invoices.form.lineItems')} action={action}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-175 text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
              <th className="py-2 pr-3">{t('invoices.form.itemCode')}</th>
              <th className="py-2 pr-3">{t('invoices.form.description')}</th>
              <th className="py-2 pr-3 text-right">{t('invoices.form.quantity')}</th>
              <th className="py-2 pr-3 text-right">{t('invoices.form.unitPrice')}</th>
              <th className="py-2 pr-3 text-right">{t('invoices.form.taxRate')}</th>
              <th className="py-2 pr-3 text-right">{t('invoices.form.discountRate')}</th>
              <th className="py-2 text-right">{t('invoices.form.amount')}</th>
              {isEditing && <th className="py-2 pl-3" />}
            </tr>
          </thead>
          <tbody>
            {isEditing
              ? rows.map((row) => (
                  <tr key={row.key} className="border-b border-slate-100 text-slate-700">
                    <td className="py-2 pr-3">
                      <input
                        value={row.item_code}
                        onChange={(e) => updateRow(row.key, 'item_code', e.target.value)}
                        className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        value={row.description}
                        onChange={(e) => updateRow(row.key, 'description', e.target.value)}
                        className="w-full min-w-37.5 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.quantity}
                        onChange={(e) => updateRow(row.key, 'quantity', e.target.value)}
                        className="w-20 rounded-md border border-slate-300 px-2 py-1.5 text-right text-sm focus:border-slate-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.unit_price}
                        onChange={(e) => updateRow(row.key, 'unit_price', e.target.value)}
                        className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-right text-sm focus:border-slate-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.tax_rate}
                        onChange={(e) => updateRow(row.key, 'tax_rate', e.target.value)}
                        className="w-16 rounded-md border border-slate-300 px-2 py-1.5 text-right text-sm focus:border-slate-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.discount_rate}
                        onChange={(e) => updateRow(row.key, 'discount_rate', e.target.value)}
                        className="w-16 rounded-md border border-slate-300 px-2 py-1.5 text-right text-sm focus:border-slate-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 text-right text-slate-400">—</td>
                    <td className="py-2 pl-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeRow(row.key)}
                        disabled={rows.length <= 1}
                        aria-label={t('invoices.detail.removeLineItem')}
                        className="flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              : lineItems.map((item) => (
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

      {isEditing && (
        <button
          type="button"
          onClick={addRow}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 py-2 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-700"
        >
          <Plus size={14} />
          {t('invoices.detail.addLineItem')}
        </button>
      )}

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
