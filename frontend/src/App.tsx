import type { ReactNode } from 'react'
import { ToastContainer } from '@/components/ToastContainer'
import { useSessionBootstrap } from '@/features/auth/hooks/useSessionBootstrap'

export function App({ children }: { children: ReactNode }) {
  useSessionBootstrap()
  return (
    <>
      {children}
      <ToastContainer />
    </>
  )
}
