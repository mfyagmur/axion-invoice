export function formatIban(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (!cleaned) return ''
  const groups = cleaned.match(/.{1,4}/g) || []
  return groups.join(' ')
}

export function sanitizeIban(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
}
