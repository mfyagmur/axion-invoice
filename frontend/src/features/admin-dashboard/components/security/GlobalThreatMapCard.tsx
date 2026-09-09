import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe2, Search } from 'lucide-react'
import { Card } from '@/components/Card'
import { Modal } from '@/components/Modal'
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

function ThreatDot({ point, size }: { point: SecurityThreatPoint; size: 'sm' | 'lg' }) {
  const { left, top } = latLonToPercent(point.latitude, point.longitude)
  const title = [point.city, point.country].filter(Boolean).join(', ') || `${point.latitude.toFixed(1)}, ${point.longitude.toFixed(1)}`
  const dotSize = size === 'lg' ? 'h-3.5 w-3.5' : 'h-2.5 w-2.5'

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left, top }} title={`${title} (${point.count})`}>
      <span className={`relative flex ${dotSize}`}>
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${SEVERITY_PING_COLOR[point.severity]}`} />
        <span className={`relative inline-flex ${dotSize} rounded-full ${SEVERITY_DOT_COLOR[point.severity]}`} />
      </span>
    </div>
  )
}

function countBySeverity(points: SecurityThreatPoint[], severity: ThreatSeverity): number {
  return points.reduce((sum, point) => (point.severity === severity ? sum + point.count : sum), 0)
}

function ThreatMapLegend({ points, size }: { points: SecurityThreatPoint[]; size: 'sm' | 'lg' }) {
  const { t } = useTranslation()
  const text = size === 'lg' ? 'text-xs' : 'text-[11px]'
  const dot = size === 'lg' ? 'h-2.5 w-2.5' : 'h-2 w-2'
  const countText = size === 'lg' ? 'text-[11px]' : 'text-[10px]'

  return (
    <div className={`absolute bottom-2 left-2 flex flex-col gap-1 rounded-md bg-white/85 px-2 py-1.5 ${text} backdrop-blur-sm dark:bg-slate-900/85`}>
      <div className="flex items-center gap-1.5">
        <span className={`${dot} rounded-full bg-red-500`} />
        <span className="text-slate-600 dark:text-slate-300">{t('admin.dashboard.security.threatMap.legendCritical')}</span>
        <span className={`ml-auto font-semibold text-red-600 dark:text-red-400 ${countText}`}>
          {countBySeverity(points, 'critical')}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`${dot} rounded-full bg-orange-500`} />
        <span className="text-slate-600 dark:text-slate-300">{t('admin.dashboard.security.threatMap.legendHigh')}</span>
        <span className={`ml-auto font-semibold text-orange-600 dark:text-orange-400 ${countText}`}>
          {countBySeverity(points, 'high')}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`${dot} rounded-full bg-yellow-400`} />
        <span className="text-slate-600 dark:text-slate-300">{t('admin.dashboard.security.threatMap.legendMedium')}</span>
        <span className={`ml-auto font-semibold text-yellow-600 dark:text-yellow-400 ${countText}`}>
          {countBySeverity(points, 'medium')}
        </span>
      </div>
    </div>
  )
}

function ThreatMapCanvas({ points, size }: { points: SecurityThreatPoint[]; size: 'sm' | 'lg' }) {
  return (
    <div className="relative w-full flex-1 overflow-hidden rounded-lg" style={{ aspectRatio: '2 / 1' }}>
      <WorldMapBase dotRadius={size === 'lg' ? 0.4 : 0.32} />
      {points.map((point, index) => (
        <ThreatDot key={`${point.latitude}-${point.longitude}-${index}`} point={point} size={size} />
      ))}
      <ThreatMapLegend points={points} size={size} />
    </div>
  )
}

export function GlobalThreatMapCard({ data, isLoading, className }: GlobalThreatMapCardProps) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const points = data ?? []

  return (
    <Card
      icon={<Globe2 size={16} />}
      title={t('admin.dashboard.security.threatMap.title')}
      action={
        !isLoading && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label={t('admin.dashboard.security.threatMap.expand')}
            title={t('admin.dashboard.security.threatMap.expand')}
          >
            <Search size={16} />
          </button>
        )
      }
      className={`flex h-full flex-col ${className ?? ''}`}
    >
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isLoading && <ThreatMapCanvas points={points} size="sm" />}

      <Modal isOpen={isExpanded} onClose={() => setIsExpanded(false)} title={t('admin.dashboard.security.threatMap.modalTitle')} size="xl">
        <div className="flex h-full flex-col">
          <ThreatMapCanvas points={points} size="lg" />
        </div>
      </Modal>
    </Card>
  )
}
