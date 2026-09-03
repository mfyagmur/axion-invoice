import { useAuthStore } from '@/store/authStore'
import { DemoDashboard } from '@/features/dashboard/components/DemoDashboard'
import { UserDashboard } from '@/features/dashboard/components/UserDashboard'

export function DashboardHomePage() {
  const user = useAuthStore((state) => state.user)

  if (user?.is_demo) {
    return <DemoDashboard />
  }

  return <UserDashboard />
}
