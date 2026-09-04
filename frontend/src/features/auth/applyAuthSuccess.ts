import { authApi } from '@/features/auth/api/authApi'
import { syncLocaleFromUser } from '@/features/auth/syncLocaleFromUser'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types/auth'

export async function applyAuthSuccess(accessToken: string): Promise<User> {
  useAuthStore.getState().setAccessToken(accessToken)
  const user = await authApi.me()
  useAuthStore.getState().setAuth(user, accessToken)
  syncLocaleFromUser(user)
  return user
}
