import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import { ToastContainer } from '@/components/ToastContainer'
import { useSessionBootstrap } from '@/features/auth/hooks/useSessionBootstrap'
import { useIsDarkMode } from '@/store/themeStore'

export function App({ children }: { children: ReactNode }) {
  useSessionBootstrap()
  const isDark = useIsDarkMode()
  return (
    <>
      {children}
      <ToastContainer />
      <Toaster position="top-right" richColors closeButton theme={isDark ? 'dark' : 'light'} />
    </>
  )
}
