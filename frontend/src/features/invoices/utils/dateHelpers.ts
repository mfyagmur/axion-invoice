export function formatDateForInput(date: Date | null | undefined): string {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateFromInput(dateString: string): Date | null {
  if (!dateString) return null
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

export function isSameDay(d1: Date | null, d2: Date | null): boolean {
  if (!d1 || !d2) return false
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

export function isSameMonth(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()
}

export function isDateInRange(date: Date | null, start: Date | null, end: Date | null): boolean {
  if (!date || !start || !end) return false
  return date >= start && date <= end
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getMonthDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

  const days: Date[] = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    const prevMonthDay = new Date(year, month, -i)
    days.unshift(prevMonthDay)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }

  while (days.length % 7 !== 0) {
    const nextMonthDay = new Date(year, month + 1, days.length - startingDayOfWeek - daysInMonth + 1)
    days.push(nextMonthDay)
  }

  return days
}

export interface DateRangePreset {
  label: string
  apply: () => { start: Date | null; end: Date | null }
}

export function getDateRangePresets(): DateRangePreset[] {
  const today = startOfDay(new Date())

  return [
    {
      label: 'Bugün',
      apply: () => ({ start: today, end: today }),
    },
    {
      label: 'Son 7 gün',
      apply: () => ({
        start: addDays(today, -6),
        end: today,
      }),
    },
    {
      label: 'Geçen Ay',
      apply: () => {
        const lastMonth = addMonths(today, -1)
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth),
        }
      },
    },
    {
      label: 'Son 3 Ay',
      apply: () => ({
        start: addDays(today, -89),
        end: today,
      }),
    },
    {
      label: 'Geçen Yıl',
      apply: () => {
        const oneYearAgo = addDays(today, -365)
        return {
          start: oneYearAgo,
          end: today,
        }
      },
    },
    {
      label: 'Tümü',
      apply: () => ({
        start: null,
        end: null,
      }),
    },
  ]
}

export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(date)
}

export function formatDateDisplay(date: Date | null): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}
