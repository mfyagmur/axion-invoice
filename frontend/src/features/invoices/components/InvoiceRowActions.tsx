import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import type { InvoiceRow } from '@/features/invoices/types/invoiceRow'
import { PaymentChaserPanel } from '@/features/invoices/components/PaymentChaserPanel'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useCancelInvoice } from '@/features/invoices/hooks/useCancelInvoice'
import { useRestoreInvoice } from '@/features/invoices/hooks/useRestoreInvoice'
import { useArchiveInvoice } from '@/features/invoices/hooks/useArchiveInvoice'
import { useUnarchiveInvoice } from '@/features/invoices/hooks/useUnarchiveInvoice'

interface InvoiceRowActionsProps {
  row: InvoiceRow
  disableView?: boolean
}

const activeItemClass = 'w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50'
const disabledItemClass = 'w-full px-3 py-2 text-left text-sm text-slate-400 cursor-not-allowed'

export function InvoiceRowActions({ row, disableView = false }: InvoiceRowActionsProps) {
  const invoiceId = row.id
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isPaymentChaserOpen, setIsPaymentChaserOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'cancel' | 'restore' | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const cancelMutation = useCancelInvoice()
  const restoreMutation = useRestoreInvoice()
  const archiveMutation = useArchiveInvoice()
  const unarchiveMutation = useUnarchiveInvoice()

  const isCancelled = row.status === 'cancelled'
  const isArchived = row.archived
  const isCancellable =
    !isCancelled && row.status !== 'paid' && !(row.status === 'draft' && row.paymentReminderActive)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return
      }
      setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleScroll = () => setIsOpen(false)
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [isOpen])

  function toggleMenu() {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    }
    setIsOpen((prev) => !prev)
  }

  function closeConfirm() {
    setConfirmAction(null)
  }

  function handleConfirm() {
    if (confirmAction === 'cancel') {
      cancelMutation.mutate(invoiceId)
    } else if (confirmAction === 'restore') {
      restoreMutation.mutate(invoiceId)
    }
    setConfirmAction(null)
  }

  const viewItem = disableView ? (
    <span className={disabledItemClass}>{t('invoices.actions.view')}</span>
  ) : (
    <Link
      to={`/dashboard/invoices/${invoiceId}`}
      onClick={() => setIsOpen(false)}
      className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
    >
      {t('invoices.actions.view')}
    </Link>
  )

  const unarchiveItem = (
    <button
      type="button"
      onClick={() => {
        setIsOpen(false)
        unarchiveMutation.mutate(invoiceId)
      }}
      className={activeItemClass}
    >
      {t('invoices.actions.unarchive')}
    </button>
  )

  let menuBody: ReactNode

  if (isCancelled) {
    menuBody = (
      <>
        {viewItem}
        <div className="border-t border-slate-100" />
        <button
          type="button"
          onClick={() => {
            setIsOpen(false)
            setConfirmAction('restore')
          }}
          className={activeItemClass}
        >
          {t('invoices.actions.restoreInvoice')}
        </button>
        {isArchived && unarchiveItem}
      </>
    )
  } else if (isArchived) {
    menuBody = (
      <>
        {viewItem}
        <div className="border-t border-slate-100" />
        <button
          type="button"
          disabled={!isCancellable}
          onClick={() => {
            setIsOpen(false)
            setConfirmAction('cancel')
          }}
          className={isCancellable ? activeItemClass : disabledItemClass}
        >
          {t('invoices.actions.cancelInvoice')}
        </button>
        {unarchiveItem}
      </>
    )
  } else {
    menuBody = (
      <>
        {viewItem}
        <div className="border-t border-slate-100" />
        <button
          type="button"
          onClick={() => {
            setIsOpen(false)
            navigate(`/dashboard/invoices/new?duplicateFrom=${invoiceId}`)
          }}
          className={activeItemClass}
        >
          {t('invoices.actions.duplicate')}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false)
            setIsPaymentChaserOpen(true)
          }}
          className={activeItemClass}
        >
          {t('invoices.actions.paymentReminder')}
        </button>
        <button type="button" disabled className={disabledItemClass}>
          {t('invoices.actions.preview')}
        </button>
        <button type="button" disabled className={disabledItemClass}>
          {t('invoices.actions.sendEmail')}
        </button>
        <button
          type="button"
          onClick={async () => {
            try {
              const response = await fetch(`/api/invoices/${invoiceId}/pdf`)
              if (!response.ok) throw new Error('PDF indirilemedi')
              const blob = await response.blob()
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `fatura-${invoiceId}.pdf`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              window.URL.revokeObjectURL(url)
              setIsOpen(false)
            } catch (error) {
              console.error('PDF indirme hatası:', error)
            }
          }}
          className={activeItemClass}
        >
          {t('invoices.actions.downloadPdf')}
        </button>
        <button
          type="button"
          disabled={!isCancellable}
          onClick={() => {
            setIsOpen(false)
            setConfirmAction('cancel')
          }}
          className={isCancellable ? activeItemClass : disabledItemClass}
        >
          {t('invoices.actions.cancelInvoice')}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false)
            archiveMutation.mutate(invoiceId)
          }}
          className={activeItemClass}
        >
          {t('invoices.actions.archive')}
        </button>
      </>
    )
  }

  const menu = isOpen && menuPosition && (
    <div
      ref={menuRef}
      style={{ position: 'fixed', top: menuPosition.top, right: menuPosition.right }}
      className="z-20 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      {menuBody}
    </div>
  )

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className="inline-flex items-center justify-center rounded-md border border-transparent p-2 hover:border-slate-900 hover:bg-slate-100 text-slate-500"
        aria-label="actions"
      >
        <MoreHorizontal size={16} />
      </button>

      {menu && createPortal(menu, document.body)}

      <PaymentChaserPanel row={row} isOpen={isPaymentChaserOpen} onClose={() => setIsPaymentChaserOpen(false)} />

      <ConfirmDialog
        isOpen={confirmAction !== null}
        title={
          confirmAction === 'restore'
            ? t('invoices.actions.restoreConfirmTitle')
            : t('invoices.actions.cancelConfirmTitle')
        }
        message={
          confirmAction === 'restore'
            ? t('invoices.actions.restoreConfirmMessage')
            : t('invoices.actions.cancelConfirm')
        }
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        variant={confirmAction === 'cancel' ? 'danger' : 'default'}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </div>
  )
}
