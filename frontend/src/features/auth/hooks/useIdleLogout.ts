import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/features/auth/api/authApi'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'] as const

export function useIdleLogout(): void {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sessionTimeoutMinutes = useAuthStore((state) => state.user?.session_timeout_minutes)

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
      const timeoutMs = (sessionTimeoutMinutes ?? 5) * 60 * 1000
      timeoutRef.current = setTimeout(triggerIdleLogout, timeoutMs)
    }

    resetTimer()
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }))

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer))
    }
  }, [navigate, t, sessionTimeoutMinutes])
}
