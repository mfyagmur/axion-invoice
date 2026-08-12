import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Textarea } from '@/components/Textarea'
import { EditIconButton } from '@/features/invoices/components/EditIconButton'
import { useUpdateInvoice } from '@/features/invoices/hooks/useUpdateInvoice'
import type { InvoiceStatus } from '@/types/invoice'

interface AdditionalDetailsGridProps {
  invoiceId: string
  status: InvoiceStatus
  notes: string | null
}

export function AdditionalDetailsGrid({ invoiceId, status, notes }: AdditionalDetailsGridProps) {
  const { t } = useTranslation()
  const updateInvoice = useUpdateInvoice()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const canEdit = status === 'draft'

  if (!notes && !canEdit) {
    return null
  }

  const startEditing = () => {
    setDraft(notes ?? '')
    setIsEditing(true)
  }

  const handleSave = () => {
    updateInvoice.mutate(
      { id: invoiceId, payload: { notes: draft || null } },
      { onSuccess: () => setIsEditing(false) },
    )
  }

  const action = !canEdit ? null : isEditing ? (
    <div className="flex items-center gap-2">
      <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} disabled={updateInvoice.isPending}>
        {t('common.cancel')}
      </Button>
      <Button type="button" onClick={handleSave} disabled={updateInvoice.isPending}>
        {t('common.save')}
      </Button>
    </div>
  ) : (
    <EditIconButton onClick={startEditing} />
  )

  return (
    <Card title={t('invoices.form.notes')} action={action}>
      <div className="grid grid-cols-1 gap-4">
        {isEditing ? (
          <Textarea
            label={t('invoices.form.notes')}
            hideLabel
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('invoices.form.notesPlaceholder')}
            rows={4}
          />
        ) : notes ? (
          <p className="whitespace-pre-wrap text-sm text-slate-600">{notes}</p>
        ) : (
          <p className="text-sm text-slate-400">{t('invoices.detail.notesEmpty')}</p>
        )}
      </div>
    </Card>
  )
}
