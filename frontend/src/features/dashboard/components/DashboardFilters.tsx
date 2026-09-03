import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/Button'
import { Select } from '@/components/Select'
import { DateRangePickerPopover } from '@/features/invoices/components/DateRangePickerPopover'
import { useDateFormat } from '@/hooks/useDateFormat'

interface DashboardFiltersProps {
  dateFrom: Date | null
  dateTo: Date | null
  onDateChange: (from: Date | null, to: Date | null) => void
  currency: string
  onCurrencyChange: (currency: string) => void
  availableCurrencies: string[]
}

export function DashboardFilters({
  dateFrom,
  dateTo,
  onDateChange,
  currency,
  onCurrencyChange,
  availableCurrencies,
}: DashboardFiltersProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
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

  const currencyOptions = availableCurrencies.map((code) => ({ value: code, label: code }))

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={currency} onChange={onCurrencyChange} options={currencyOptions} className="w-28" />

      <div ref={containerRef} className="relative shrink-0">
        <Button variant="secondary" className="px-3" onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}>
          <Calendar size={16} className="mr-2" />
          {dateFrom && dateTo
            ? `${formatDate(dateFrom)} — ${formatDate(dateTo)}`
            : t('dashboard.demo.charts.allTime')}
        </Button>

        {isDatePickerOpen && (
          <DateRangePickerPopover
            startDate={dateFrom}
            endDate={dateTo}
            onApply={onDateChange}
            onClose={() => setIsDatePickerOpen(false)}
          />
        )}
      </div>
    </div>
  )
}
