import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { Card } from '@/components/Card'
import { formatDateDisplay } from '@/features/invoices/utils/dateHelpers'
import type { InvoiceStatus } from '@/types/invoice'

interface StatusTimelineProps {
  status: InvoiceStatus
  createdAt: string
  recipientEmail?: string | null
}

export function StatusTimeline({ status, createdAt, recipientEmail }: StatusTimelineProps) {
  const { t } = useTranslation()

  // NOTE: backend'de ayrı bir "ödeme alındı" durumu yok, bu yüzden
  // "Ödeme Alındı" ve "Ödendi" adımları status === 'paid' olduğunda birlikte tamamlanmış sayılıyor.
  const isPaid = status === 'paid'

  const steps = [
    {
      label: t('invoices.detail.timelineCreated'),
      date: formatDateDisplay(new Date(createdAt)),
      done: true,
    },
    {
      label: t('invoices.detail.timelinePaymentReceived'),
      date: isPaid ? formatDateDisplay(new Date(createdAt)) : null,
      done: isPaid,
    },
    {
      label: t('invoices.detail.timelinePaid'),
      date: isPaid ? formatDateDisplay(new Date(createdAt)) : null,
      done: isPaid,
    },
  ]

  return (
    <Card>
      <div className="flex flex-col">
        {steps.map((step, index) => (
          <div key={step.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="relative flex h-3 w-3 shrink-0">
                {step.done && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-75" />
                )}
                <span
                  className={twMerge(
                    'relative inline-flex h-3 w-3 rounded-full border-2',
                    step.done ? 'border-sky-500 bg-sky-500' : 'border-slate-300 bg-white',
                  )}
                />
              </span>
              {index < steps.length - 1 && (
                <span className={twMerge('w-px flex-1', step.done ? 'bg-slate-900' : 'bg-slate-200')} />
              )}
            </div>
            <div className={twMerge('flex flex-col pb-6', index === steps.length - 1 && 'pb-0')}>
              <span className={twMerge('text-sm font-medium', step.done ? 'text-slate-900' : 'text-slate-400')}>
                {step.label}
              </span>
              {step.date && <span className="text-xs text-slate-500">{step.date}</span>}
            </div>
          </div>
        ))}
      </div>
      {recipientEmail && (
        <div className="border-t border-slate-200 pt-4 mt-4">
          <p className="text-sm text-slate-600">
            Fatura <strong>{recipientEmail}</strong> adresine gönderilmiştir.
          </p>
          <p className="text-sm text-slate-600">
            Alıcının ödemeyi yapması bekleniyor.
          </p>
        </div>
      )}
    </Card>
  )
}
