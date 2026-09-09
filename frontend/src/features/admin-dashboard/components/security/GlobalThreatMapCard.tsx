import { useTranslation } from 'react-i18next'
import { Globe2 } from 'lucide-react'
import { Card } from '@/components/Card'
import { WorldMapBase, latLonToPercent } from '@/features/admin-dashboard/components/security/WorldMapBase'
import type { SecurityThreatPoint, ThreatSeverity } from '@/features/admin-dashboard/types/adminDashboard'

interface GlobalThreatMapCardProps {
  data: SecurityThreatPoint[] | undefined
  isLoading: boolean
  className?: string
}

const SEVERITY_DOT_COLOR: Record<ThreatSeverity, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-400',
}

const SEVERITY_PING_COLOR: Record<ThreatSeverity, string> = {
  critical: 'bg-red-400',
  high: 'bg-orange-400',
  medium: 'bg-yellow-300',
}

function ThreatDot({ point }: { point: SecurityThreatPoint }) {
  const { left, top } = latLonToPercent(point.latitude, point.longitude)
  const title = [point.city, point.country].filter(Boolean).join(', ') || `${point.latitude.toFixed(1)}, ${point.longitude.toFixed(1)}`

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left, top }} title={`${title} (${point.count})`}>
      <span className="relative flex h-2.5 w-2.5">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${SEVERITY_PING_COLOR[point.severity]}`} />
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${SEVERITY_DOT_COLOR[point.severity]}`} />
      </span>
    </div>
  )
}

export function GlobalThreatMapCard({ data, isLoading, className }: GlobalThreatMapCardProps) {
  const { t } = useTranslation()
  const points = data ?? []

  return (
    <Card
      icon={<Globe2 size={16} />}
      title={t('admin.dashboard.security.threatMap.title')}
      className={`flex h-full flex-col ${className ?? ''}`}
    >
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isLoading && (
        <div className="relative w-full flex-1 overflow-hidden rounded-lg" style={{ aspectRatio: '2 / 1' }}>
          <WorldMapBase />
          {points.map((point, index) => (
            <ThreatDot key={`${point.latitude}-${point.longitude}-${index}`} point={point} />
          ))}
          <div className="absolute bottom-2 left-2 flex flex-col gap-1 rounded-md bg-white/85 px-2 py-1.5 text-[11px] backdrop-blur-sm dark:bg-slate-900/85">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-slate-600 dark:text-slate-300">{t('admin.dashboard.security.threatMap.legendCritical')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-slate-600 dark:text-slate-300">{t('admin.dashboard.security.threatMap.legendHigh')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              <span className="text-slate-600 dark:text-slate-300">{t('admin.dashboard.security.threatMap.legendMedium')}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
