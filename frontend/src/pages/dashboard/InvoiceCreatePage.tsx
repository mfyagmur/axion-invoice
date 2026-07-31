import { useTranslation } from 'react-i18next'
import { InvoiceForm } from '@/features/invoices/components/InvoiceForm'

export function InvoiceCreatePage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-slate-900">{t('invoices.list.newInvoice')}</h1>
      <InvoiceForm />
    </div>
  )
}
