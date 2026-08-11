import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import { ToastContainer } from '@/components/ToastContainer'
import { useSessionBootstrap } from '@/features/auth/hooks/useSessionBootstrap'

export function App({ children }: { children: ReactNode }) {
  useSessionBootstrap()
  return (
    <>
      {children}
      <ToastContainer />
      <Toaster position="top-right" richColors closeButton />
    </>
  )
}
