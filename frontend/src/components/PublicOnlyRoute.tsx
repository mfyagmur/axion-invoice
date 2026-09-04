import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function PublicOnlyRoute() {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)

  if (status === 'authenticated') {
    return <Navigate to={user?.is_admin ? '/admin' : '/dashboard'} replace />
  }

  return <Outlet />
}
