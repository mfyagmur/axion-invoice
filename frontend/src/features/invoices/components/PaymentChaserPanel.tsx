import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ChevronDown, ChevronUp, FileText, Info } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { Drawer } from '@/components/Drawer'
import { Button } from '@/components/Button'
import { InvoiceStatusBadge } from '@/features/invoices/components/InvoiceStatusBadge'
import type { InvoiceRow } from '@/features/invoices/types/invoiceRow'
import { addDays, formatDateDisplay } from '@/features/invoices/utils/dateHelpers'
import { usePaymentReminder } from '@/features/invoices/hooks/usePaymentReminder'

interface PaymentChaserPanelProps {
  row: InvoiceRow
  isOpen: boolean
  onClose: () => void
}

const REMINDER_STEPS = [
  { offset: 7, ruleKey: 'ruleFirst' as const },
  { offset: 10, ruleKey: 'ruleNext' as const },
  { offset: 13, ruleKey: 'ruleNext' as const },
]

export function PaymentChaserPanel({ row, isOpen, onClose }: PaymentChaserPanelProps) {
  const { t } = useTranslation()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [activatedMessage, setActivatedMessage] = useState(false)
  const [cancelledMessage, setCancelledMessage] = useState(false)
  const { activateMutation, deactivateMutation } = usePaymentReminder()

  const createdAt = new Date(row.createdAtRaw)

  function handleClose() {
    setActivatedMessage(false)
    setCancelledMessage(false)
    onClose()
  }

  function handleActivate() {
    activateMutation.mutate(row.id, {
      onSuccess: () => {
        setActivatedMessage(true)
        setTimeout(() => {
          setActivatedMessage(false)
          onClose()
        }, 1200)
      },
    })
  }

  function handleCancel() {
    deactivateMutation.mutate(row.id, {
      onSuccess: () => {
        setCancelledMessage(true)
        setTimeout(() => {
          setCancelledMessage(false)
          onClose()
        }, 1200)
      },
    })
  }

  return (
    <Drawer isOpen={isOpen} onClose={handleClose}>
      <div className="flex items-center gap-3 border-b border-slate-100 p-4">
        <button
          type="button"
          onClick={handleClose}
          aria-label={t('invoices.paymentChaser.close')}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-base font-semibold text-slate-900">{t('invoices.paymentChaser.title')}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 rounded-md bg-blue-50 p-3">
            <Info size={18} className="mt-0.5 shrink-0 text-blue-500" />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-blue-900">{t('invoices.paymentChaser.infoTitle')}</span>
              <span className="text-xs text-blue-800">{t('invoices.paymentChaser.infoBody')}</span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-100 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-blue-500">
                  <FileText size={16} />
                </span>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">{row.invoiceNumber}</span>
                  <span className="font-semibold text-slate-900">{row.customerCompanyName}</span>
                </div>
              </div>
              <InvoiceStatusBadge status={row.status} />
            </div>

            <div className="mt-4 flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-sm text-slate-900">{formatDateDisplay(createdAt)}</span>
                {row.customerEmail && <span className="text-xs text-slate-500">{row.customerEmail}</span>}
              </div>
              <div className="flex flex-col items-end text-right">
                <span className="font-semibold text-slate-900">
                  {row.amount} {row.currency}
                </span>
                {row.secondaryAmount && <span className="text-xs text-slate-500">{row.secondaryAmount}</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {REMINDER_STEPS.map((step, index) => {
              const isExpanded = expandedIndex === index
              const date = addDays(createdAt, step.offset)
              return (
                <div key={index} className="rounded-lg border border-slate-100 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900">
                        {t('invoices.paymentChaser.emailLabel', { n: index + 1 })}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {/* ({t(`invoices.paymentChaser.${step.ruleKey}`)}) {formatDateDisplay(date)} */}
                        {formatDateDisplay(date)}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-slate-500" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-500" />
                    )}
                  </button>

                  <div
                    className={twMerge(
                      'grid transition-[grid-template-rows] duration-300 ease-in-out',
                      isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
                        {t('invoices.paymentChaser.emailBodyPlaceholder')}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {activatedMessage && (
            <p className="text-sm font-medium text-green-700">{t('invoices.paymentChaser.activatedMessage')}</p>
          )}
          {cancelledMessage && (
            <p className="text-sm font-medium text-amber-700">{t('invoices.paymentChaser.cancelledMessage')}</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-start gap-3 border-t border-slate-100 p-4">
        <Button
          type="button"
          variant="secondary"
          onClick={handleClose}
          className="px-6 hover:bg-slate-200 text-slate-700"
          disabled={activateMutation.isPending || deactivateMutation.isPending}
        >
          {t('invoices.paymentChaser.close')}
        </Button>

        {row.paymentReminderActive ? (
          <Button
            type="button"
            onClick={handleCancel}
            className="px-6 whitespace-nowrap bg-rose-800 text-white hover:bg-rose-900 focus:ring-rose-500"
            disabled={activateMutation.isPending || deactivateMutation.isPending}
          >
            {t('invoices.paymentChaser.cancel')}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleActivate}
            className="px-6 whitespace-nowrap bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
            disabled={activateMutation.isPending || deactivateMutation.isPending}
          >
            {t('invoices.paymentChaser.activate')}
          </Button>
        )}
      </div>
    </Drawer>
  )
}
