import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Select } from '@/components/Select'
import { EditIconButton } from '@/features/invoices/components/EditIconButton'
import { useUpdateInvoice } from '@/features/invoices/hooks/useUpdateInvoice'
import { useBankAccounts } from '@/features/definitions/hooks/useBankAccounts'
import type { InvoiceStatus } from '@/types/invoice'
import type { DefinitionBankAccount } from '@/types/definitions'

interface BankAccountSectionProps {
  invoiceId: string
  status: InvoiceStatus
  bankAccounts: (DefinitionBankAccount | null)[]
}

const FIELD_NAMES = ['bank_account_id', 'bank_account_id_2', 'bank_account_id_3'] as const

export function BankAccountSection({ invoiceId, status, bankAccounts }: BankAccountSectionProps) {
  const { t } = useTranslation()
  const updateInvoice = useUpdateInvoice()
  const { data: availableBankAccounts } = useBankAccounts()
  const [isEditing, setIsEditing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>(bankAccounts.map((b) => b?.id ?? ''))

  const canEdit = status === 'draft'
  const hasAnyBankAccount = bankAccounts.some((b) => !!b)

  if (!hasAnyBankAccount && !canEdit) {
    return null
  }

  const handleSave = () => {
    updateInvoice.mutate(
      {
        id: invoiceId,
        payload: {
          bank_account_id: selectedIds[0] || null,
          bank_account_id_2: selectedIds[1] || null,
          bank_account_id_3: selectedIds[2] || null,
        },
      },
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
    <EditIconButton onClick={() => { setSelectedIds(bankAccounts.map((b) => b?.id ?? '')); setIsEditing(true) }} />
  )

  return (
    <Card title={t('invoices.detail.bankAccount')} action={action}>
      <div className="grid grid-cols-1 gap-4">
        {isEditing ? (
          FIELD_NAMES.map((fieldName, index) => (
            <Select
              key={fieldName}
              label={`${t('invoices.detail.bankAccount')} - ${index + 1}`}
              value={selectedIds[index]}
              onChange={(value) => setSelectedIds((prev) => prev.map((id, i) => (i === index ? value : id)))}
              options={availableBankAccounts?.filter((b) => b.is_active).map((b) => ({
                value: b.id,
                label: `${b.bank_name} — ${b.iban} (${b.currency})`,
              })) || []}
              placeholder={t('invoices.detail.selectBankAccount')}
            />
          ))
        ) : hasAnyBankAccount ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {bankAccounts.map((bankAccount, index) =>
              bankAccount ? (
                <div key={bankAccount.id}>
                  <p className="text-sm font-medium text-slate-900">{bankAccount.bank_name}</p>
                  <p className="text-xs text-slate-500">{bankAccount.branch_name} (Şube Kodu: {bankAccount.branch_code})</p>
                  <p className="text-sm text-slate-700 font-mono mt-2">{bankAccount.iban}</p>
                  <p className="text-xs text-slate-500 mt-1">Hesap No: {bankAccount.account_number} — {bankAccount.currency}</p>
                </div>
              ) : (
                <div key={`empty-${index}`} />
              ),
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400">{t('invoices.detail.noBankAccount')}</p>
        )}
      </div>
    </Card>
  )
}
