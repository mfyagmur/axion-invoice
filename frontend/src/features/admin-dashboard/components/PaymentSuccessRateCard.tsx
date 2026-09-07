import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from 'recharts'
import type { PieSectorDataItem } from 'recharts/types/polar/Pie'
import { Card } from '@/components/Card'
import type { PaymentSuccessRate } from '@/features/admin-dashboard/types/adminDashboard'

interface PaymentSuccessRateCardProps {
  data: PaymentSuccessRate | undefined
  isLoading: boolean
}

function useCountUp(target: number | undefined, durationMs = 800) {
  const [value, setValue] = useState(0)
  const frameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (target === undefined) return
    const start = performance.now()
    const from = value

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(from + (target - from) * eased)
      if (progress < 1) frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs])

  return value
}

function renderActiveShape(props: PieSectorDataItem) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={(outerRadius ?? 0) + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={(outerRadius ?? 0) + 11}
        outerRadius={(outerRadius ?? 0) + 14}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.35}
      />
    </g>
  )
}

export function PaymentSuccessRateCard({ data, isLoading }: PaymentSuccessRateCardProps) {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const slices = data
    ? [
        { name: t('admin.dashboard.financial.success'), value: data.paid_pct, color: '#3b82f6' },
        { name: t('admin.dashboard.financial.failed'), value: data.failed_pct, color: '#f97316' },
        { name: t('admin.dashboard.financial.pending'), value: data.pending_pct, color: '#fcd34d' },
      ]
    : []

  const displayedIndex = activeIndex ?? 0
  const displayedSlice = slices[displayedIndex]
  const animatedValue = useCountUp(displayedSlice?.value)

  return (
    <Card title={t('admin.dashboard.financial.paymentSuccessRate')} className="flex h-full flex-col items-center p-4 w-fit pr-9">
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isLoading && data && (
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="relative">
            <ResponsiveContainer width={164} height={164}>
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={38}
                  outerRadius={64}
                  paddingAngle={2}
                  isAnimationActive
                  animationBegin={0}
                  animationDuration={900}
                  animationEasing="ease-out"
                  activeIndex={displayedIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {slices.map((slice) => (
                    <Cell key={slice.name} fill={slice.color} className="cursor-pointer transition-opacity duration-200" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-200">
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {animatedValue.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{displayedSlice?.name}</span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {slices.map((slice, index) => (
              <div
                key={slice.name}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`flex cursor-pointer items-center gap-1.5 text-xs transition-colors duration-150 ${
                  displayedIndex === index
                    ? 'font-semibold text-slate-900 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: slice.color }} />
                {slice.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
