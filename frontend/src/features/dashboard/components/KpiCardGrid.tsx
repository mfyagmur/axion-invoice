import { useTranslation } from 'react-i18next'
import { AlertTriangle, CheckCircle2, Clock, FileEdit, Wallet } from 'lucide-react'
import { KpiCard } from './KpiCard'
import type { DashboardOverview } from '@/features/dashboard/types/dashboard'

interface KpiCardGridProps {
  overview: DashboardOverview
}

export function KpiCardGrid({ overview }: KpiCardGridProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <KpiCard title={t('dashboard.demo.kpi.total')} icon={<Wallet size={20} />} data={overview.total} />
      <KpiCard title={t('dashboard.demo.kpi.paid')} icon={<CheckCircle2 size={20} />} data={overview.paid} />
      <KpiCard title={t('dashboard.demo.kpi.pending')} icon={<Clock size={20} />} data={overview.pending} />
      <KpiCard title={t('dashboard.demo.kpi.overdue')} icon={<AlertTriangle size={20} />} data={overview.overdue} />
      <KpiCard title={t('dashboard.demo.kpi.draft')} icon={<FileEdit size={20} />} data={overview.draft} />
    </div>
  )
}
