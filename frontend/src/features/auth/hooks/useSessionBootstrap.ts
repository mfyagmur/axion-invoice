import { useEffect } from 'react'
import { authApi } from '@/features/auth/api/authApi'
import { syncLocaleFromUser } from '@/features/auth/syncLocaleFromUser'
import { useAuthStore } from '@/store/authStore'

export function useSessionBootstrap(): void {
  useEffect(() => {
    const { setStatus, setAuth, clearAuth } = useAuthStore.getState()
    setStatus('loading')

    authApi
      .refresh()
      .then(async ({ access_token }) => {
        const user = await authApi.me()
        setAuth(user, access_token)
        syncLocaleFromUser(user)
      })
      .catch(() => {
        clearAuth()
      })
  }, [])
}
