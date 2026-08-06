import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { InvoiceForm } from '@/features/invoices/components/InvoiceForm'

export function InvoiceCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
          aria-label={t('common.back')}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-semibold text-slate-900">{t('invoices.list.newInvoice')}</h1>
      </div>
      <InvoiceForm />
    </div>
  )
}
