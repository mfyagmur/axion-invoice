import { apiClient } from '@/lib/apiClient'

const CLIENT_ID_STORAGE_KEY = 'axion_client_id'

export function getPresenceClientId(): string {
  try {
    const existing = localStorage.getItem(CLIENT_ID_STORAGE_KEY)
    if (existing) return existing

    const generated = crypto.randomUUID()
    localStorage.setItem(CLIENT_ID_STORAGE_KEY, generated)
    return generated
  } catch {
    return crypto.randomUUID()
  }
}

export function sendPresenceHeartbeat(): void {
  const clientId = getPresenceClientId()
  apiClient.post('/presence/heartbeat', { client_id: clientId }).catch(() => {})
}
