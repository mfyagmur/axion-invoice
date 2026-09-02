import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import axios from 'axios'
import { MoreHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import type { InvoiceRow } from '@/features/invoices/types/invoiceRow'
import { PaymentChaserPanel } from '@/features/invoices/components/PaymentChaserPanel'
import { InvoiceDocumentPreview } from '@/features/invoices/components/InvoiceDocumentPreview'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useCancelInvoice } from '@/features/invoices/hooks/useCancelInvoice'
import { useRestoreInvoice } from '@/features/invoices/hooks/useRestoreInvoice'
import { useArchiveInvoice } from '@/features/invoices/hooks/useArchiveInvoice'
import { useUnarchiveInvoice } from '@/features/invoices/hooks/useUnarchiveInvoice'
import { useDownloadInvoicePdf } from '@/features/invoices/hooks/useDownloadInvoicePdf'
import { useSendInvoiceEmail } from '@/features/invoices/hooks/useSendInvoiceEmail'
import { useToastStore } from '@/store/toastStore'
import { useAuthStore } from '@/store/authStore'

interface InvoiceRowActionsProps {
  row: InvoiceRow
  disableView?: boolean
  hideViewPreviewDownload?: boolean
}

const activeItemClass = 'w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'
const disabledItemClass = 'w-full px-3 py-2 text-left text-sm text-slate-400 cursor-not-allowed dark:text-slate-600'

export function InvoiceRowActions({ row, disableView = false, hideViewPreviewDownload = false }: InvoiceRowActionsProps) {
  const invoiceId = row.id
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isPaymentChaserOpen, setIsPaymentChaserOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'cancel' | 'restore' | null>(null)
  const [menuPosition, setMenuPosition] = useState<{
    top?: number
    bottom?: number
    right: number
    maxHeight?: number
  } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const cancelMutation = useCancelInvoice()
  const restoreMutation = useRestoreInvoice()
  const archiveMutation = useArchiveInvoice()
  const unarchiveMutation = useUnarchiveInvoice()
  const downloadPdf = useDownloadInvoicePdf()
  const sendEmail = useSendInvoiceEmail()
  const pushToast = useToastStore((state) => state.push)
  const isDemo = useAuthStore((state) => state.user?.is_demo ?? false)

  function blockIfDemo(): boolean {
    if (isDemo) {
      pushToast(t('demo.actionBlocked'), 'error')
    }
    return isDemo
  }

  const isPdfReady = row.pdfStatus === 'ready'
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
    const handleResize = () => setIsOpen(false)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen])

  // Measures the rendered menu after the initial (provisional) placement and,
  // before the browser paints, flips it to a drop-up if it would overflow the
  // bottom of the viewport (or clamps its height if it doesn't fit either way).
  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current || !menuRef.current) {
      return
    }

    const buttonRect = buttonRef.current.getBoundingClientRect()
    const menuHeight = menuRef.current.getBoundingClientRect().height
    const viewportHeight = window.innerHeight
    const margin = 8

    const spaceBelow = viewportHeight - buttonRect.bottom - margin
    const spaceAbove = buttonRect.top - margin
    const right = window.innerWidth - buttonRect.right

    if (menuHeight <= spaceBelow) {
      setMenuPosition({ top: buttonRect.bottom + 4, right })
    } else if (menuHeight <= spaceAbove) {
      setMenuPosition({ bottom: viewportHeight - buttonRect.top + 4, right })
    } else if (spaceBelow >= spaceAbove) {
      setMenuPosition({ top: buttonRect.bottom + 4, right, maxHeight: spaceBelow })
    } else {
      setMenuPosition({ bottom: viewportHeight - buttonRect.top + 4, right, maxHeight: spaceAbove })
    }
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

  const viewItem = hideViewPreviewDownload ? null : disableView ? (
    <span className={disabledItemClass}>{t('invoices.actions.view')}</span>
  ) : (
    <Link
      to={`/dashboard/invoices/${invoiceId}`}
      onClick={() => setIsOpen(false)}
      className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
    >
      {t('invoices.actions.view')}
    </Link>
  )

  const unarchiveItem = (
    <button
      type="button"
      onClick={() => {
        setIsOpen(false)
        if (blockIfDemo()) return
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
        <div className="border-t border-slate-100 dark:border-slate-700" />
        <button
          type="button"
          onClick={() => {
            setIsOpen(false)
            if (blockIfDemo()) return
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
        <div className="border-t border-slate-100 dark:border-slate-700" />
        <button
          type="button"
          disabled={!isCancellable}
          onClick={() => {
            setIsOpen(false)
            if (blockIfDemo()) return
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
        {viewItem && <div className="border-t border-slate-100" />}
        <button
          type="button"
          disabled={isDemo}
          onClick={() => {
            setIsOpen(false)
            if (isDemo) {
              blockIfDemo()
              return
            }
            navigate(`/dashboard/invoices/new?duplicateFrom=${invoiceId}`)
          }}
          className={isDemo ? disabledItemClass : activeItemClass}
        >
          {t('invoices.actions.duplicate')}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false)
            if (blockIfDemo()) return
            setIsPaymentChaserOpen(true)
          }}
          className={activeItemClass}
        >
          {t('invoices.actions.paymentReminder')}
        </button>
        {!hideViewPreviewDownload && (
          <>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                setIsPreviewOpen(true)
              }}
              className={activeItemClass}
            >
              {t('invoices.actions.preview')}
            </button>
            <button
              type="button"
              disabled={isDemo || sendEmail.isPending}
              onClick={() => {
                setIsOpen(false)
                if (isDemo) {
                  blockIfDemo()
                  return
                }
                sendEmail.mutate(invoiceId, {
                  onSuccess: () => pushToast(t('invoices.detail.emailSent'), 'success'),
                  onError: (error) => {
                    const detail = axios.isAxiosError(error) ? error.response?.data?.detail : undefined
                    pushToast(detail || t('invoices.detail.emailSendError') || 'E-posta gönderilemedi')
                  },
                })
              }}
              className={isDemo ? disabledItemClass : activeItemClass}
            >
              {t('invoices.actions.sendEmail')}
            </button>
            <button
              type="button"
              disabled={isDemo || !isPdfReady || downloadPdf.isPending}
              onClick={() => {
                setIsOpen(false)
                if (isDemo) {
                  blockIfDemo()
                  return
                }
                downloadPdf.mutate({ id: invoiceId, filename: row.invoiceNumber })
              }}
              className={isDemo || !isPdfReady ? disabledItemClass : activeItemClass}
            >
              {t('invoices.actions.downloadPdf')}
            </button>
          </>
        )}
        <button
          type="button"
          disabled={isDemo || !isCancellable}
          onClick={() => {
            setIsOpen(false)
            if (isDemo) {
              blockIfDemo()
              return
            }
            setConfirmAction('cancel')
          }}
          className={isDemo || !isCancellable ? disabledItemClass : activeItemClass}
        >
          {t('invoices.actions.cancelInvoice')}
        </button>
        <button
          type="button"
          disabled={isDemo}
          onClick={() => {
            setIsOpen(false)
            if (isDemo) {
              blockIfDemo()
              return
            }
            archiveMutation.mutate(invoiceId)
          }}
          className={isDemo ? disabledItemClass : activeItemClass}
        >
          {t('invoices.actions.archive')}
        </button>
      </>
    )
  }

  const menu = isOpen && menuPosition && (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: menuPosition.top,
        bottom: menuPosition.bottom,
        right: menuPosition.right,
        maxHeight: menuPosition.maxHeight,
        overflowY: menuPosition.maxHeight ? 'auto' : undefined,
      }}
      className="z-20 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
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
        className="inline-flex items-center justify-center rounded-md border border-transparent p-2 hover:border-slate-900 hover:bg-slate-100 text-slate-500 dark:hover:border-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
        aria-label="actions"
      >
        <MoreHorizontal size={16} />
      </button>

      {menu && createPortal(menu, document.body)}

      <PaymentChaserPanel row={row} isOpen={isPaymentChaserOpen} onClose={() => setIsPaymentChaserOpen(false)} />

      <InvoiceDocumentPreview
        invoiceId={invoiceId}
        invoiceNumber={row.invoiceNumber}
        isOpen={isPreviewOpen}
        isPdfReady={isPdfReady}
        onClose={() => setIsPreviewOpen(false)}
      />

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
