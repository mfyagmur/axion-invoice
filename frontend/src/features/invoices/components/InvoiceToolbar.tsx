import { useEffect, useRef, useState } from 'react'
import { Calendar, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'
import { Select } from '@/components/Select'

interface InvoiceToolbarProps {
  searchQuery: string
  onSearchChange: (v: string) => void
  statusFilter: string
  onStatusFilterChange: (v: string) => void
  dateFrom: string
  dateTo: string
  onDateChange: (from: string, to: string) => void
}

export function InvoiceToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFrom,
  dateTo,
  onDateChange,
}: InvoiceToolbarProps) {
  const { t } = useTranslation()
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const statusOptions = [
    { value: 'all', label: t('invoices.toolbar.statusAll') },
    { value: 'draft', label: t('invoices.status.draft') },
    { value: 'sent', label: t('invoices.status.sent') },
    { value: 'paid', label: t('invoices.status.paid') },
    { value: 'overdue', label: t('invoices.status.overdue') },
    { value: 'cancelled', label: t('invoices.status.cancelled') },
  ]

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={t('invoices.toolbar.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pl-9 text-sm text-slate-900 placeholder-slate-400 transition-all hover:bg-slate-50 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
        />
      </div>

      <Select
        value={statusFilter}
        onChange={onStatusFilterChange}
        options={statusOptions}
        className="w-40"
      />

      <div ref={containerRef} className="relative shrink-0">
        <Button variant="secondary" className="px-3" onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}>
          <Calendar size={16} />
        </Button>

        {isDatePickerOpen && (
          <div className="absolute right-0 top-full z-20 mt-1 rounded-md border border-slate-200 bg-white p-4 shadow-lg">
            <div className="flex flex-col gap-3 min-w-[250px]">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">{t('invoices.toolbar.dateFrom')}</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => onDateChange(e.target.value, dateTo)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">{t('invoices.toolbar.dateTo')}</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => onDateChange(dateFrom, e.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
