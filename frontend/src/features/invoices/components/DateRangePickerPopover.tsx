import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'
import {
  formatMonthYear,
  getMonthDays,
  isSameDay,
  isSameMonth,
  isDateInRange,
  addMonths,
  startOfDay,
  getDateRangePresets,
} from '@/features/invoices/utils/dateHelpers'

interface DateRangePickerPopoverProps {
  startDate: Date | null
  endDate: Date | null
  onApply: (start: Date | null, end: Date | null) => void
  onClose: () => void
}

const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export function DateRangePickerPopover({ startDate, endDate, onApply, onClose }: DateRangePickerPopoverProps) {
  const { t } = useTranslation()
  const [tempStart, setTempStart] = useState<Date | null>(startDate)
  const [tempEnd, setTempEnd] = useState<Date | null>(endDate)
  const [currentMonth, setCurrentMonth] = useState(startOfDay(new Date()))

  const presets = getDateRangePresets()
  const nextMonth = addMonths(currentMonth, 1)

  const handlePresetClick = (preset: (typeof presets)[0]) => {
    const { start, end } = preset.apply()
    setTempStart(start)
    setTempEnd(end)
  }

  const handleDayClick = (day: Date) => {
    const selected = startOfDay(day)
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(selected)
      setTempEnd(null)
    } else if (selected < tempStart) {
      setTempStart(selected)
    } else {
      setTempEnd(selected)
    }
  }

  const handleApply = () => {
    onApply(tempStart, tempEnd)
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <div
      className="absolute right-0 top-full mt-2 z-50 rounded-lg border border-slate-200 bg-white shadow-lg"
      style={{ width: 'clamp(20rem, 90vw, 56rem)' }}
    >
      <div className="flex h-96 overflow-hidden">
        {/* Left Sidebar - Presets */}
        <div className="w-40 sm:w-48 border-r border-slate-200 p-3 sm:p-4 flex flex-col gap-1 bg-slate-50 rounded-l-lg overflow-y-auto">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm text-slate-700 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Right Side - Dual Calendar */}
        <div className="flex-1 p-2 sm:p-4 flex flex-col overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 flex-1 min-w-max sm:min-w-0">
            {[currentMonth, nextMonth].map((month) => (
              <div key={month.toISOString()} className="flex flex-col">
                {/* Month Header */}
                <div className="flex items-center justify-between mb-2 sm:mb-4 gap-1">
                  {month.getMonth() === currentMonth.getMonth() && (
                    <button
                      onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                      className="p-0.5 sm:p-1 hover:bg-slate-100 rounded transition-colors shrink-0"
                    >
                      <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  )}
                  {month.getMonth() === nextMonth.getMonth() && (
                    <button
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                      className="ml-auto p-0.5 sm:p-1 hover:bg-slate-100 rounded transition-colors shrink-0"
                    >
                      <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  )}
                  {month.getMonth() !== currentMonth.getMonth() && (
                    <div className="w-4 sm:w-6 shrink-0" />
                  )}
                  <h3 className="text-xs sm:text-sm font-medium text-slate-900 flex-1 text-center">
                    {formatMonthYear(month)}
                  </h3>
                  {month.getMonth() !== nextMonth.getMonth() && (
                    <div className="w-4 sm:w-6 shrink-0" />
                  )}
                </div>

                {/* Weekday Labels */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {WEEKDAY_LABELS.map((label) => (
                    <div key={label} className="text-center text-xs font-medium text-slate-600 pb-2 border-b border-slate-300">
                      {label}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {getMonthDays(month.getFullYear(), month.getMonth()).map((day) => {
                    const isCurrentMonth = isSameMonth(day, month)
                    const isStart = tempStart ? isSameDay(day, tempStart) : false
                    const isEnd = tempEnd ? isSameDay(day, tempEnd) : false
                    const isInRange =
                      tempStart &&
                      tempEnd &&
                      isDateInRange(day, tempStart, tempEnd) &&
                      !isStart &&
                      !isEnd
                    const isClickable = isCurrentMonth

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => isClickable && handleDayClick(day)}
                        disabled={!isClickable}
                        className={`
                          aspect-square rounded text-xs font-medium transition-all
                          ${
                            !isCurrentMonth
                              ? 'text-slate-300 cursor-default'
                              : 'text-slate-900 cursor-pointer hover:bg-slate-100'
                          }
                          ${isStart || isEnd ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                          ${isInRange ? 'bg-blue-50' : ''}
                        `}
                      >
                        {day.getDate()}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 mt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <Button onClick={handleApply} variant="primary">
              {t('common.save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
