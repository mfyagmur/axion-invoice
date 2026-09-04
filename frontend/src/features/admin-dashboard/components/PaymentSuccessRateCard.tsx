import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
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

export function PaymentSuccessRateCard({ data, isLoading }: PaymentSuccessRateCardProps) {
  const { t } = useTranslation()
  const animatedPaidPct = useCountUp(data?.paid_pct)

  const slices = data
    ? [
        { name: t('admin.dashboard.financial.success'), value: data.paid_pct, color: '#3b82f6' },
        { name: t('admin.dashboard.financial.failed'), value: data.failed_pct, color: '#f97316' },
        { name: t('admin.dashboard.financial.pending'), value: data.pending_pct, color: '#fcd34d' },
      ]
    : []

  return (
    <Card title={t('admin.dashboard.financial.paymentSuccessRate')} className="flex h-full flex-col items-center p-4 w-fit pr-9">
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
      {!isLoading && data && (
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="relative">
            <ResponsiveContainer width={136} height={136}>
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={46}
                  outerRadius={64}
                  paddingAngle={2}
                  isAnimationActive
                  animationBegin={0}
                  animationDuration={900}
                  animationEasing="ease-out"
                >
                  {slices.map((slice) => (
                    <Cell key={slice.name} fill={slice.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {animatedPaidPct.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{t('admin.dashboard.financial.success')}</span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {slices.map((slice) => (
              <div key={slice.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
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
