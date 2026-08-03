import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/features/auth/api/authApi'
import { SESSION_IDLE_TIMEOUT_MS } from '@/features/auth/sessionConfig'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'] as const

export function useIdleLogout(): void {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const triggerIdleLogout = () => {
      const { clearAuth } = useAuthStore.getState()
      authApi.logout().finally(() => {
        clearAuth()
        useToastStore.getState().push(t('session.idleTimeout'))
        navigate('/login')
      })
    }

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(triggerIdleLogout, SESSION_IDLE_TIMEOUT_MS)
    }

    resetTimer()
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }))

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer))
    }
  }, [navigate, t])
}
