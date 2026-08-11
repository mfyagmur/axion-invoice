import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { InvoiceForm } from '@/features/invoices/components/InvoiceForm'
import { useInvoice } from '@/features/invoices/hooks/useInvoice'
import { buildDuplicateInitialValues } from '@/features/invoices/utils/buildDuplicateInitialValues'

export function InvoiceCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const duplicateFrom = searchParams.get('duplicateFrom') ?? undefined

  const { data: sourceInvoice, isLoading, isError } = useInvoice(duplicateFrom)

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

      {duplicateFrom && isLoading ? (
        <p className="text-sm text-slate-500">{t('common.loading')}</p>
      ) : (
        <>
          {duplicateFrom && isError && (
            <p className="text-sm text-red-600">{t('common.genericError')}</p>
          )}
          <InvoiceForm
            key={sourceInvoice?.id ?? 'blank'}
            initialValues={sourceInvoice ? buildDuplicateInitialValues(sourceInvoice) : undefined}
          />
        </>
      )}
    </div>
  )
}
