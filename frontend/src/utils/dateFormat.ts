export type DateFormatPattern = 'DD.MM.YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
export const DEFAULT_DATE_FORMAT: DateFormatPattern = 'DD.MM.YYYY'

const PATTERN_CONFIG: Record<DateFormatPattern, { order: ('day' | 'month' | 'year')[]; separator: string }> = {
  'DD.MM.YYYY': { order: ['day', 'month', 'year'], separator: '.' },
  'MM/DD/YYYY': { order: ['month', 'day', 'year'], separator: '/' },
  'YYYY-MM-DD': { order: ['year', 'month', 'day'], separator: '-' },
}

function toValidDate(input: Date | string | null | undefined): Date | null {
  if (!input) return null
  const d = typeof input === 'string' ? new Date(input) : input
  return isNaN(d.getTime()) ? null : d
}

function isValidPattern(p: string | undefined): p is DateFormatPattern {
  return !!p && p in PATTERN_CONFIG
}

export function normalizeDateFormat(p: string | undefined | null): DateFormatPattern {
  return isValidPattern(p ?? undefined) ? (p as DateFormatPattern) : DEFAULT_DATE_FORMAT
}

export function formatDate(
  date: Date | string | null | undefined,
  pattern: DateFormatPattern = DEFAULT_DATE_FORMAT,
): string {
  const d = toValidDate(date)
  if (!d) return ''
  const parts = {
    day: String(d.getDate()).padStart(2, '0'),
    month: String(d.getMonth() + 1).padStart(2, '0'),
    year: String(d.getFullYear()),
  }
  const { order, separator } = PATTERN_CONFIG[pattern]
  return order.map((k) => parts[k]).join(separator)
}

export interface VerbalDateOptions {
  month?: 'long' | 'short'
  includeTime?: boolean
}

export function formatDateVerbal(
  date: Date | string | null | undefined,
  pattern: DateFormatPattern,
  locale: 'tr' | 'en',
  options: VerbalDateOptions = {},
): string {
  const d = toValidDate(date)
  if (!d) return ''
  const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US'
  const monthStyle = options.month ?? 'long'

  const parts = new Intl.DateTimeFormat(localeTag, {
    day: 'numeric',
    month: monthStyle,
    year: 'numeric',
  }).formatToParts(d)
  const day = parts.find((p) => p.type === 'day')?.value ?? ''
  const month = parts.find((p) => p.type === 'month')?.value ?? ''
  const year = parts.find((p) => p.type === 'year')?.value ?? ''

  const order = PATTERN_CONFIG[pattern].order
  let result: string
  if (order[0] === 'month') {
    result = `${month} ${day}, ${year}`
  } else if (order[0] === 'year') {
    result = `${year} ${month} ${day}`
  } else {
    result = `${day} ${month} ${year}`
  }

  if (options.includeTime) {
    const time = new Intl.DateTimeFormat(localeTag, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
    result += ` ${time}`
  }
  return result
}
