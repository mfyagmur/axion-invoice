import { apiClient } from '@/lib/apiClient'
import type { UserSession } from '@/types/session'

export const sessionsApi = {
  list: async (): Promise<UserSession[]> => {
    const { data } = await apiClient.get('/sessions')
    return data
  },

  revoke: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/sessions/${sessionId}`)
  },

  revokeOthers: async (): Promise<{ revoked_count: number }> => {
    const { data } = await apiClient.post('/sessions/revoke-others')
    return data
  },
}
