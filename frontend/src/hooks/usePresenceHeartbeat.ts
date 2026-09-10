import { useEffect } from 'react'
import { sendPresenceHeartbeat } from '@/lib/presenceHeartbeat'

const HEARTBEAT_INTERVAL_MS = 20_000

export function usePresenceHeartbeat() {
  useEffect(() => {
    sendPresenceHeartbeat()

    let intervalId: ReturnType<typeof setInterval> | null = null

    const startInterval = () => {
      if (intervalId !== null) return
      intervalId = setInterval(sendPresenceHeartbeat, HEARTBEAT_INTERVAL_MS)
    }

    const stopInterval = () => {
      if (intervalId === null) return
      clearInterval(intervalId)
      intervalId = null
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendPresenceHeartbeat()
        startInterval()
      } else {
        stopInterval()
      }
    }

    startInterval()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopInterval()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}
