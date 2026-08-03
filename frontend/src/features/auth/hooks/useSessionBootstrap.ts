import { useEffect, useRef } from 'react'
import { authApi } from '@/features/auth/api/authApi'
import { applyAuthSuccess } from '@/features/auth/applyAuthSuccess'
import { useAuthStore } from '@/store/authStore'

export function useSessionBootstrap(): void {
  const hasRunRef = useRef(false)

  useEffect(() => {
    if (hasRunRef.current) return
    hasRunRef.current = true

    const { setStatus, clearAuth } = useAuthStore.getState()
    setStatus('loading')

    authApi
      .refresh()
      .then(({ access_token }) => applyAuthSuccess(access_token))
      .catch(() => {
        clearAuth()
      })
  }, [])
}
