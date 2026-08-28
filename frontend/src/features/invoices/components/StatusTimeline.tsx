import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { Card } from '@/components/Card'
import { useDateFormat } from '@/hooks/useDateFormat'
import type { InvoiceStatus } from '@/types/invoice'

interface StatusTimelineProps {
  status: InvoiceStatus
  createdAt: string
  emailSentAt?: string | null
  emailSentTo?: string[] | null
}

export function StatusTimeline({ status, createdAt, emailSentAt, emailSentTo }: StatusTimelineProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()

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
  if (completedStepsCount === 1) {
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
              Fatura {formatDate(createdAt)} tarihinde oluşturuldu. Henüz e-posta gönderilmedi.
            </p>
          )}
          {statusMessage === 'sent' && (
            <>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Fatura <strong>{emailSentToLabel}</strong> adresine gönderilmiştir.
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Alıcının ödemeyi yapması bekleniyor.
              </p>
            </>
          )}
          {statusMessage === 'payment-received' && (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Ödeme sistem tarafından doğrulaması bekleniyor.
            </p>
          )}
          {statusMessage === 'paid' && (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Alıcı tarafından ödeme gerçekleştirmiştir.
            </p>
          )}
        </div>
      )}
    </Card>
  )
}
