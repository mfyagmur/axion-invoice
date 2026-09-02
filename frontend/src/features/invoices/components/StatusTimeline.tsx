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

type StepTone = 'neutral' | 'danger'

interface Step {
  label: string
  date: string | null
  detail?: string | null
  done: boolean
  tone: StepTone
}

export function StatusTimeline({ status, displayStatus, archived, createdAt, emailSentAt, emailSentTo, dueAt }: StatusTimelineProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()

  const isCancelled = status === 'cancelled'
  const isPaid = status === 'paid'
  const isOverdue = displayStatus === 'overdue'
  const isEmailSent = !!emailSentAt
  const emailSentToLabel = emailSentTo?.join(', ')

  const steps: Step[] = [
    {
      label: t('invoices.detail.timelineCreated'),
      date: formatDate(createdAt),
      detail: null,
      done: true,
      tone: 'neutral',
    },
    {
      label: t('invoices.detail.timelineEmailSent'),
      date: isEmailSent ? formatDate(emailSentAt) : null,
      detail: isEmailSent ? emailSentToLabel : null,
      done: isEmailSent,
      tone: 'neutral',
    },
  ]

  if (isCancelled) {
    steps.push({
      label: t('invoices.detail.timelineCancelled'),
      date: null,
      detail: null,
      done: true,
      tone: 'danger',
    })
  } else if (isPaid) {
    steps.push({
      label: t('invoices.detail.timelinePaid'),
      date: formatDate(createdAt),
      detail: null,
      done: true,
      tone: 'neutral',
    })
  } else if (isOverdue) {
    steps.push({
      label: t('invoices.detail.timelineOverdue'),
      date: dueAt ? formatDate(dueAt) : null,
      detail: null,
      done: true,
      tone: 'danger',
    })
  }

  let messageKey: string
  if (isCancelled) {
    messageKey = 'timelineMessageCancelled'
  } else if (isPaid) {
    messageKey = 'timelineMessagePaid'
  } else if (isOverdue) {
    messageKey = 'timelineMessageOverdue'
  } else if (isEmailSent) {
    messageKey = 'timelineMessageSent'
  } else {
    messageKey = 'timelineMessageCreatedOnly'
  }

  return (
    <Card>
      {archived && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
          {t('invoices.detail.timelineArchivedNote')}
        </div>
      )}
      <div className="flex flex-col">
        {steps.map((step, index) => (
          <div key={step.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="relative flex h-3 w-3 shrink-0">
                {step.done && step.tone === 'neutral' && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-75" />
                )}
                {step.done && step.tone === 'danger' && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                )}
                <span
                  className={twMerge(
                    'relative inline-flex h-3 w-3 rounded-full border-2',
                    !step.done && 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800',
                    step.done && step.tone === 'neutral' && 'border-sky-500 bg-sky-500',
                    step.done && step.tone === 'danger' && 'border-red-500 bg-red-500',
                  )}
                />
              </span>
              {index < steps.length - 1 && (
                <span className={twMerge('w-px flex-1', step.done ? 'bg-slate-900 dark:bg-slate-100' : 'bg-slate-200 dark:bg-slate-700')} />
              )}
            </div>
            <div className={twMerge('flex flex-col pb-6', index === steps.length - 1 && 'pb-0')}>
              <span
                className={twMerge(
                  'text-sm font-medium',
                  !step.done && 'text-slate-400 dark:text-slate-500',
                  step.done && step.tone === 'neutral' && 'text-slate-900 dark:text-slate-100',
                  step.done && step.tone === 'danger' && 'text-red-600 dark:text-red-400',
                )}
              >
                {step.label}
              </span>
              {step.date && <span className="text-xs text-slate-500 dark:text-slate-400">{step.date}</span>}
              {step.detail && <span className="text-xs text-slate-500 dark:text-slate-400">{step.detail}</span>}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 pt-4 mt-4 dark:border-slate-700">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {t(`invoices.detail.${messageKey}`, { email: emailSentToLabel, date: formatDate(createdAt) })}
        </p>
      </div>
    </Card>
  )
}
