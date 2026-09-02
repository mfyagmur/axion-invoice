import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { Card } from '@/components/Card'
import { useDateFormat } from '@/hooks/useDateFormat'
import type { InvoiceDisplayStatus, InvoiceStatus } from '@/types/invoice'

interface StatusTimelineProps {
  status: InvoiceStatus
  displayStatus: InvoiceDisplayStatus
  archived: boolean
  createdAt: string
  emailSentAt?: string | null
  emailSentTo?: string[] | null
  dueAt?: string | null
}

export function StatusTimeline({ status, displayStatus, archived, createdAt, emailSentAt, emailSentTo }: StatusTimelineProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()

  const isCancelled = status === 'cancelled'
  const isOverdue = displayStatus === 'overdue'
  // NOTE: backend'de ayrı bir "ödeme alındı" durumu yok, bu yüzden
  // "Ödeme Alındı" ve "Ödendi" adımları status === 'paid' olduğunda birlikte tamamlanmış sayılıyor.
  const isPaid = status === 'paid'
  const isEmailSent = !!emailSentAt
  const emailSentToLabel = emailSentTo?.join(', ')

  const steps = [
    {
      label: t('invoices.detail.timelineCreated'),
      date: formatDate(createdAt),
      detail: null as string | null | undefined,
      done: true,
    },
    {
      label: t('invoices.detail.timelineEmailSent'),
      date: isEmailSent ? formatDate(emailSentAt) : null,
      detail: isEmailSent ? emailSentToLabel : null,
      done: isEmailSent,
    },
    {
      label: t('invoices.detail.timelinePaymentReceived'),
      date: isPaid ? formatDate(createdAt) : null,
      detail: null,
      done: isPaid,
    },
    {
      label: t('invoices.detail.timelinePaid'),
      date: isPaid ? formatDate(createdAt) : null,
      detail: null,
      done: isPaid,
    },
  ]

  const completedStepsCount = steps.filter(s => s.done).length

  // Tamamlanan adım sayısına göre mesaj belirle
  let statusMessage: string | null = null
  if (isCancelled) {
    statusMessage = 'cancelled'
  } else if (isOverdue) {
    statusMessage = 'overdue'
  } else if (completedStepsCount === 1) {
    // Sadece ilk adım: fatura oluşturuldu, henüz e-posta gönderilmedi
    statusMessage = 'created-only'
  } else if (completedStepsCount === 2) {
    // İlk iki adım: fatura e-postayla gönderildi, ödeme bekleniyor
    statusMessage = 'sent'
  } else if (completedStepsCount === 3) {
    // Üçüncü adım: Ödeme alındı (sistem doğrulaması bekleniyor)
    statusMessage = 'payment-received'
  } else if (completedStepsCount === 4) {
    // Dördüncü adım: Ödendi (alıcı tarafından ödeme yapıldı)
    statusMessage = 'paid'
  }

  return (
    <Card>
      {(archived || isCancelled || isOverdue) && (
        <div className="mb-4 flex flex-col gap-2">
          {archived && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
              {t('invoices.detail.timelineArchivedNote')}
            </div>
          )}
          {isCancelled && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              {t('invoices.detail.timelineCancelledNote')}
            </div>
          )}
          {isOverdue && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              {t('invoices.detail.timelineOverdueNote')}
            </div>
          )}
        </div>
      )}
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
                    step.done ? 'border-sky-500 bg-sky-500' : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800',
                  )}
                />
              </span>
              {index < steps.length - 1 && (
                <span className={twMerge('w-px flex-1', step.done ? 'bg-slate-900 dark:bg-slate-100' : 'bg-slate-200 dark:bg-slate-700')} />
              )}
            </div>
            <div className={twMerge('flex flex-col pb-6', index === steps.length - 1 && 'pb-0')}>
              <span className={twMerge('text-sm font-medium', step.done ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500')}>
                {step.label}
              </span>
              {step.date && <span className="text-xs text-slate-500 dark:text-slate-400">{step.date}</span>}
              {step.detail && <span className="text-xs text-slate-500 dark:text-slate-400">{step.detail}</span>}
            </div>
          </div>
        ))}
      </div>
      {statusMessage && (
        <div className="border-t border-slate-200 pt-4 mt-4 dark:border-slate-700">
          {statusMessage === 'created-only' && (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t('invoices.detail.timelineMessageCreatedOnly', { date: formatDate(createdAt) })}
            </p>
          )}
          {statusMessage === 'sent' && (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t('invoices.detail.timelineMessageSent', { email: emailSentToLabel })}
            </p>
          )}
          {statusMessage === 'payment-received' && (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t('invoices.detail.timelineMessagePaymentReceived')}
            </p>
          )}
          {statusMessage === 'paid' && (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t('invoices.detail.timelineMessagePaid')}
            </p>
          )}
          {statusMessage === 'overdue' && (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t('invoices.detail.timelineMessageOverdue')}
            </p>
          )}
          {statusMessage === 'cancelled' && (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t('invoices.detail.timelineMessageCancelled')}
            </p>
          )}
        </div>
      )}
    </Card>
  )
}
