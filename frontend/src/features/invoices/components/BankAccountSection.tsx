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
  bankAccount: DefinitionBankAccount | null
}

export function BankAccountSection({ invoiceId, status, bankAccount }: BankAccountSectionProps) {
  const { t } = useTranslation()
  const updateInvoice = useUpdateInvoice()
  const { data: bankAccounts } = useBankAccounts()
  const [isEditing, setIsEditing] = useState(false)
  const [selectedId, setSelectedId] = useState(bankAccount?.id ?? '')

  const canEdit = status === 'draft'

  if (!bankAccount && !canEdit) {
    return null
  }

  const handleSave = () => {
    updateInvoice.mutate(
      { id: invoiceId, payload: { bank_account_id: selectedId || null } },
      { onSuccess: () => setIsEditing(false) },
    )
  }

  const displayText = bankAccount ? `${bankAccount.bank_name} — ${bankAccount.iban}` : t('invoices.detail.noBankAccount')

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
    <EditIconButton onClick={() => { setSelectedId(bankAccount?.id ?? ''); setIsEditing(true) }} />
  )

  return (
    <Card title={t('invoices.detail.bankAccount')} action={action}>
      <div className="grid grid-cols-1 gap-4">
        {isEditing ? (
          <Select
            label={t('invoices.detail.bankAccount')}
            hideLabel
            value={selectedId}
            onChange={setSelectedId}
            options={bankAccounts?.filter(b => b.is_active).map(b => ({
              value: b.id,
              label: `${b.bank_name} — ${b.iban} (${b.currency})`,
            })) || []}
            placeholder={t('invoices.detail.selectBankAccount')}
          />
        ) : bankAccount ? (
          <div>
            <p className="text-sm font-medium text-slate-900">{bankAccount.bank_name}</p>
            <p className="text-xs text-slate-500">{bankAccount.branch_name} (Şube Kodu: {bankAccount.branch_code})</p>
            <p className="text-sm text-slate-700 font-mono mt-2">{bankAccount.iban}</p>
            <p className="text-xs text-slate-500 mt-1">Hesap No: {bankAccount.account_number} — {bankAccount.currency}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-400">{t('invoices.detail.noBankAccount')}</p>
        )}
      </div>
    </Card>
  )
}
