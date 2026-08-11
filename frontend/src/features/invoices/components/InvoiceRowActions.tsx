import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

interface InvoiceRowActionsProps {
  invoiceId: string
}

export function InvoiceRowActions({ invoiceId }: InvoiceRowActionsProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center rounded-md border border-transparent p-2 hover:border-slate-900 hover:bg-slate-100 text-slate-500"
        aria-label="actions"
      >
        <MoreHorizontal size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          <Link
            to={`/dashboard/invoices/${invoiceId}`}
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            {t('invoices.actions.view')}
          </Link>
          <div className="border-t border-slate-100" />
          <button
            type="button"
            disabled
            className="w-full px-3 py-2 text-left text-sm text-slate-400 cursor-not-allowed"
          >
            {t('invoices.actions.duplicate')}
          </button>
          <button
            type="button"
            disabled
            className="w-full px-3 py-2 text-left text-sm text-slate-400 cursor-not-allowed"
          >
            {t('invoices.actions.paymentReminder')}
          </button>
          <button
            type="button"
            disabled
            className="w-full px-3 py-2 text-left text-sm text-slate-400 cursor-not-allowed"
          >
            {t('invoices.actions.preview')}
          </button>
          <button
            type="button"
            disabled
            className="w-full px-3 py-2 text-left text-sm text-slate-400 cursor-not-allowed"
          >
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
            className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            {t('invoices.actions.downloadPdf')}
          </button>
          <button
            type="button"
            disabled
            className="w-full px-3 py-2 text-left text-sm text-slate-400 cursor-not-allowed"
          >
            {t('invoices.actions.cancelInvoice')}
          </button>
          <button
            type="button"
            disabled
            className="w-full px-3 py-2 text-left text-sm text-slate-400 cursor-not-allowed"
          >
            {t('invoices.actions.archive')}
          </button>
        </div>
      )}
    </div>
  )
}
