import { useMemo, useState } from 'react'
import { Clock, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { ErrorState } from '@/components/ErrorState'
import { Tabs } from '@/components/Tabs'
import { useInvoices } from '@/features/invoices/hooks/useInvoices'
import { InvoiceToolbar } from '@/features/invoices/components/InvoiceToolbar'
import { InvoiceTable } from '@/features/invoices/components/InvoiceTable'
import { mapInvoiceToRow } from '@/features/invoices/utils/mapInvoiceToRow'
import { MOCK_INVOICE_ROWS } from '@/features/invoices/mocks/mockInvoiceRows'

export function InvoicesPage() {
  const { t } = useTranslation()
  const { data: invoices, isLoading, isError, refetch } = useInvoices()

  const [activeTab, setActiveTab] = useState<'all' | 'scheduled'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)

  const rows = useMemo(() => (invoices ?? []).map(mapInvoiceToRow), [invoices])
  const displayRows = rows.length > 0 ? rows : MOCK_INVOICE_ROWS

  const filteredRows = displayRows.filter((row) => {
    const matchesSearch =
      searchQuery === '' ||
      row.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.customerName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || row.status === statusFilter

    const rowDate = new Date(row.createdAt)
    const matchesDateRange =
      (!dateFrom || rowDate >= dateFrom) &&
      (!dateTo || rowDate <= dateTo)

    return matchesSearch && matchesStatus && matchesDateRange
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">{t('nav.invoices')}</h1>
        <Link to="/dashboard/invoices/new">
          <Button>
            <Plus size={16} className="mr-1" />
            {t('invoices.list.newInvoice')}
          </Button>
        </Link>
      </div>

      <Tabs
        items={[
          { key: 'all', label: t('invoices.tabs.all') },
          { key: 'scheduled', label: t('invoices.tabs.scheduled'), icon: <Clock size={14} /> },
        ]}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'all' | 'scheduled')}
      />

      {activeTab === 'all' && (
        <>
          <InvoiceToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateChange={(from, to) => {
              setDateFrom(from)
              setDateTo(to)
            }}
          />

          {isLoading && <p className="text-sm text-slate-500">{t('common.loading')}</p>}

          {isError && <ErrorState onRetry={() => refetch()} />}

          {!isLoading && !isError && <InvoiceTable rows={filteredRows} />}
        </>
      )}

      {activeTab === 'scheduled' && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center">
          <Clock size={24} className="text-slate-400" />
          <p className="text-sm text-slate-500">{t('invoices.scheduled.empty')}</p>
        </div>
      )}
    </div>
  )
}
