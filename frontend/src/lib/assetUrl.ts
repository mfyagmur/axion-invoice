import { env } from '@/config/env'

const apiOrigin = new URL(env.apiBaseUrl).origin

export function getAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  return `${apiOrigin}${path}`
}
