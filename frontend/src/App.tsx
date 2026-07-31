import type { ReactNode } from 'react'
import { useSessionBootstrap } from '@/features/auth/hooks/useSessionBootstrap'

export function App({ children }: { children: ReactNode }) {
  useSessionBootstrap()
  return children
}
