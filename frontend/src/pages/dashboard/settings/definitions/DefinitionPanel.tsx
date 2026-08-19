import { useTranslation } from 'react-i18next'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { Select } from '@/components/Select'
import {
  useUnits,
  useCreateUnit,
  useUpdateUnit,
  useDeleteUnit,
  useToggleUnitStatus,
} from '@/features/definitions/hooks/useUnits'
import {
  useTaxRates,
  useCreateTaxRate,
  useUpdateTaxRate,
  useDeleteTaxRate,
  useToggleTaxRateStatus,
} from '@/features/definitions/hooks/useTaxRates'
import {
  usePaymentTerms,
  useCreatePaymentTerm,
  useUpdatePaymentTerm,
  useDeletePaymentTerm,
  useTogglePaymentTermStatus,
} from '@/features/definitions/hooks/usePaymentTerms'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useToggleCategoryStatus,
} from '@/features/definitions/hooks/useCategories'
import {
  useBankAccounts,
  useCreateBankAccount,
  useUpdateBankAccount,
  useDeleteBankAccount,
  useToggleBankAccountStatus,
} from '@/features/definitions/hooks/useBankAccounts'
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useToggleNoteStatus,
  useSetDefaultNote,
} from '@/features/definitions/hooks/useNotes'
import { useSetDefaultUnit } from '@/features/definitions/hooks/useUnits'
import { useSetDefaultTaxRate } from '@/features/definitions/hooks/useTaxRates'
import { DefinitionListSection } from '../DefinitionListSection'
import { CompanyScalarSettingForm, type ScalarSettingKey } from './CompanyScalarSettingForm'
import { formatIban, sanitizeIban } from '@/utils/formatIban'

const SCALAR_KEYS: ScalarSettingKey[] = ['currency', 'dateFormat', 'taxYearStart', 'invoiceNumber']
const CURRENCY_OPTIONS = ['TRY', 'USD', 'EUR', 'GBP']

interface DefinitionPanelProps {
  activeKey: string | null
}

export function DefinitionPanel({ activeKey }: DefinitionPanelProps) {
  const { t } = useTranslation()

  const { data: units, isLoading: unitsLoading } = useUnits()
  const createUnit = useCreateUnit()
  const updateUnit = useUpdateUnit()
  const deleteUnit = useDeleteUnit()
  const toggleUnitStatus = useToggleUnitStatus()
  const setDefaultUnit = useSetDefaultUnit()

  const { data: taxRates, isLoading: taxRatesLoading } = useTaxRates()
  const createTaxRate = useCreateTaxRate()
  const updateTaxRate = useUpdateTaxRate()
  const deleteTaxRate = useDeleteTaxRate()
  const toggleTaxRateStatus = useToggleTaxRateStatus()
  const setDefaultTaxRate = useSetDefaultTaxRate()

  const { data: paymentTerms, isLoading: paymentTermsLoading } = usePaymentTerms()
  const createPaymentTerm = useCreatePaymentTerm()
  const updatePaymentTerm = useUpdatePaymentTerm()
  const deletePaymentTerm = useDeletePaymentTerm()
  const togglePaymentTermStatus = useTogglePaymentTermStatus()

  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const toggleCategoryStatus = useToggleCategoryStatus()

  const { data: bankAccounts, isLoading: bankAccountsLoading } = useBankAccounts()
  const createBankAccount = useCreateBankAccount()
  const updateBankAccount = useUpdateBankAccount()
  const deleteBankAccount = useDeleteBankAccount()
  const toggleBankAccountStatus = useToggleBankAccountStatus()

  const { data: notes, isLoading: notesLoading } = useNotes()
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()
  const toggleNoteStatus = useToggleNoteStatus()
  const setDefaultNote = useSetDefaultNote()

  const isOpen = activeKey !== null

  return (
    <div
      className="grid transition-[grid-template-rows] duration-300 ease-in-out"
      style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
    >
      <div className="overflow-hidden">
        <div className="mt-6 rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
          {activeKey && SCALAR_KEYS.includes(activeKey as ScalarSettingKey) && (
            <CompanyScalarSettingForm settingKey={activeKey as ScalarSettingKey} />
          )}

          {activeKey === 'units' && (
            <DefinitionListSection
              title={t('settings.definitions.units')}
              items={units || []}
              isLoading={unitsLoading}
              onCreate={(payload) => createUnit.mutate(payload as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
              onUpdate={(id, payload) => updateUnit.mutate({ id, payload: payload as any })} // eslint-disable-line @typescript-eslint/no-explicit-any
              onDelete={(id) => deleteUnit.mutate(id)}
              onToggleStatus={(id) => toggleUnitStatus.mutate(id)}
              isCreating={createUnit.isPending}
              isUpdating={updateUnit.isPending}
              isDeleting={deleteUnit.isPending}
              isToggling={toggleUnitStatus.isPending}
              fields={['name']}
              renderFields={(values, setValue) => (
                <Input
                  label={t('settings.definitions.unitName')}
                  placeholder="e.g., Piece, Hour, Box"
                  hideLabel
                  value={values.name ?? ''}
                  onChange={(e) => setValue('name', e.target.value)}
                />
              )}
              buildPayload={(values) => ({ name: values.name })}
              getEditValues={(item) => ({ name: item.name ?? '' })}
              formatValue={(item) => item.name || ''}
              defaultSelection={{
                onSetDefault: (id) => setDefaultUnit.mutate(id),
                isSettingDefault: setDefaultUnit.isPending,
              }}
            />
          )}

          {activeKey === 'taxRates' && (
            <DefinitionListSection
              title={t('settings.definitions.taxRates')}
              items={taxRates || []}
              isLoading={taxRatesLoading}
              onCreate={(payload) => createTaxRate.mutate(payload as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
              onUpdate={(id, payload) => updateTaxRate.mutate({ id, payload: payload as any })} // eslint-disable-line @typescript-eslint/no-explicit-any
              onDelete={(id) => deleteTaxRate.mutate(id)}
              onToggleStatus={(id) => toggleTaxRateStatus.mutate(id)}
              isCreating={createTaxRate.isPending}
              isUpdating={updateTaxRate.isPending}
              isDeleting={deleteTaxRate.isPending}
              isToggling={toggleTaxRateStatus.isPending}
              fields={['label', 'rate']}
              renderFields={(values, setValue) => (
                <>
                  <Input
                    label={t('settings.definitions.taxRateLabel')}
                    placeholder="e.g., Standard VAT"
                    value={values.label ?? ''}
                    onChange={(e) => setValue('label', e.target.value)}
                  />
                  <Input
                    label={t('settings.definitions.taxRate')}
                    placeholder="e.g., 18"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={values.rate ?? ''}
                    onChange={(e) => setValue('rate', e.target.value)}
                  />
                </>
              )}
              buildPayload={(values) => ({ label: values.label, rate: parseFloat(values.rate) })}
              getEditValues={(item) => ({ label: item.label ?? '', rate: String(item.rate ?? '') })}
              formatValue={(item) => `${item.label} — ${item.rate}%`}
              defaultSelection={{
                onSetDefault: (id) => setDefaultTaxRate.mutate(id),
                isSettingDefault: setDefaultTaxRate.isPending,
              }}
            />
          )}

          {activeKey === 'paymentTerms' && (
            <DefinitionListSection
              title={t('settings.definitions.paymentTerms')}
              items={paymentTerms || []}
              isLoading={paymentTermsLoading}
              onCreate={(payload) => createPaymentTerm.mutate(payload as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
              onUpdate={(id, payload) => updatePaymentTerm.mutate({ id, payload: payload as any })} // eslint-disable-line @typescript-eslint/no-explicit-any
              onDelete={(id) => deletePaymentTerm.mutate(id)}
              onToggleStatus={(id) => togglePaymentTermStatus.mutate(id)}
              isCreating={createPaymentTerm.isPending}
              isUpdating={updatePaymentTerm.isPending}
              isDeleting={deletePaymentTerm.isPending}
              isToggling={togglePaymentTermStatus.isPending}
              fields={['label', 'days']}
              renderFields={(values, setValue) => (
                <>
                  <Input
                    label={t('settings.definitions.paymentTermLabel')}
                    placeholder="e.g., Net 30"
                    value={values.label ?? ''}
                    onChange={(e) => setValue('label', e.target.value)}
                  />
                  <Input
                    label={t('settings.definitions.days')}
                    placeholder="e.g., 30"
                    type="number"
                    min="0"
                    max="999"
                    value={values.days ?? ''}
                    onChange={(e) => setValue('days', e.target.value)}
                  />
                </>
              )}
              buildPayload={(values) => ({ label: values.label, days: parseInt(values.days, 10) })}
              getEditValues={(item) => ({ label: item.label ?? '', days: String(item.days ?? '') })}
              formatValue={(item) => `${item.label} — ${item.days} ${t('settings.definitions.days')}`}
            />
          )}

          {activeKey === 'categories' && (
            <DefinitionListSection
              title={t('settings.definitions.categories')}
              items={categories || []}
              isLoading={categoriesLoading}
              onCreate={(payload) => createCategory.mutate(payload as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
              onUpdate={(id, payload) => updateCategory.mutate({ id, payload: payload as any })} // eslint-disable-line @typescript-eslint/no-explicit-any
              onDelete={(id) => deleteCategory.mutate(id)}
              onToggleStatus={(id) => toggleCategoryStatus.mutate(id)}
              isCreating={createCategory.isPending}
              isUpdating={updateCategory.isPending}
              isDeleting={deleteCategory.isPending}
              isToggling={toggleCategoryStatus.isPending}
              fields={['name']}
              renderFields={(values, setValue) => (
                <Input
                  label={t('settings.definitions.categoryName')}
                  placeholder="e.g., Software, Services"
                  hideLabel
                  value={values.name ?? ''}
                  onChange={(e) => setValue('name', e.target.value)}
                />
              )}
              buildPayload={(values) => ({ name: values.name })}
              getEditValues={(item) => ({ name: item.name ?? '' })}
              formatValue={(item) => item.name || ''}
            />
          )}

          {activeKey === 'bankAccounts' && (
            <DefinitionListSection
              title={t('settings.definitions.bankAccounts')}
              items={bankAccounts || []}
              isLoading={bankAccountsLoading}
              onCreate={(payload) => createBankAccount.mutate(payload as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
              onUpdate={(id, payload) => updateBankAccount.mutate({ id, payload: payload as any })} // eslint-disable-line @typescript-eslint/no-explicit-any
              onDelete={(id) => deleteBankAccount.mutate(id)}
              onToggleStatus={(id) => toggleBankAccountStatus.mutate(id)}
              isCreating={createBankAccount.isPending}
              isUpdating={updateBankAccount.isPending}
              isDeleting={deleteBankAccount.isPending}
              isToggling={toggleBankAccountStatus.isPending}
              fields={['bank_name', 'branch_name', 'branch_code', 'currency', 'account_number', 'iban']}
              initialValues={{ currency: 'TRY' }}
              renderFields={(values, setValue) => (
                <>
                  <Input
                    label={t('settings.definitions.bankName')}
                    placeholder="e.g., Ziraat Bankası"
                    value={values.bank_name ?? ''}
                    onChange={(e) => setValue('bank_name', e.target.value)}
                  />
                  <Input
                    label={t('settings.definitions.branchName')}
                    placeholder="e.g., Merkez Şubesi"
                    value={values.branch_name ?? ''}
                    onChange={(e) => setValue('branch_name', e.target.value)}
                  />
                  <Input
                    label={t('settings.definitions.branchCode')}
                    placeholder="e.g., 001"
                    value={values.branch_code ?? ''}
                    onChange={(e) => setValue('branch_code', e.target.value)}
                  />
                  <Select
                    label={t('settings.definitions.currency')}
                    value={values.currency ?? 'TRY'}
                    onChange={(v) => setValue('currency', v)}
                    options={CURRENCY_OPTIONS.map((code) => ({ value: code, label: code }))}
                  />
                  <Input
                    label={t('settings.definitions.accountNumber')}
                    placeholder="e.g., 123456789"
                    value={values.account_number ?? ''}
                    onChange={(e) => setValue('account_number', e.target.value)}
                  />
                  <Input
                    label={t('settings.definitions.iban')}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    autoComplete="off"
                    maxLength={32}
                    value={values.iban ?? ''}
                    onChange={(e) => setValue('iban', formatIban(e.target.value))}
                  />
                </>
              )}
              buildPayload={(values) => ({
                bank_name: values.bank_name,
                branch_name: values.branch_name,
                branch_code: values.branch_code,
                currency: values.currency || 'TRY',
                account_number: values.account_number,
                iban: sanitizeIban(values.iban),
              })}
              getEditValues={(item) => ({
                bank_name: item.bank_name ?? '',
                branch_name: item.branch_name ?? '',
                branch_code: item.branch_code ?? '',
                currency: item.currency ?? 'TRY',
                account_number: item.account_number ?? '',
                iban: formatIban(item.iban ?? ''),
              })}
              formatValue={(item) => `${item.bank_name} — ${item.branch_name} — ${item.iban} — ${item.currency}`}
            />
          )}

          {activeKey === 'notes' && (
            <DefinitionListSection
              title={t('settings.definitions.fixedNotes')}
              items={notes || []}
              isLoading={notesLoading}
              onCreate={(payload) => createNote.mutate(payload as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
              onUpdate={(id, payload) => updateNote.mutate({ id, payload: payload as any })} // eslint-disable-line @typescript-eslint/no-explicit-any
              onDelete={(id) => deleteNote.mutate(id)}
              onToggleStatus={(id) => toggleNoteStatus.mutate(id)}
              isCreating={createNote.isPending}
              isUpdating={updateNote.isPending}
              isDeleting={deleteNote.isPending}
              isToggling={toggleNoteStatus.isPending}
              fields={['label', 'content']}
              renderFields={(values, setValue) => (
                <>
                  <Input
                    label={t('settings.definitions.noteLabel')}
                    placeholder="e.g., Teşekkür Notu"
                    value={values.label ?? ''}
                    onChange={(e) => setValue('label', e.target.value)}
                  />
                  <Textarea
                    label={t('settings.definitions.noteContent')}
                    placeholder="e.g., Bizi tercih ettiğiniz için teşekkür ederiz."
                    value={values.content ?? ''}
                    onChange={(e) => setValue('content', e.target.value)}
                    rows={5}
                    className="w-full min-w-150 resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </>
              )}
              buildPayload={(values) => ({ label: values.label, content: values.content })}
              getEditValues={(item) => ({ label: item.label ?? '', content: item.content ?? '' })}
              formatValue={(item) => item.label || ''}
              defaultSelection={{
                onSetDefault: (id) => setDefaultNote.mutate(id),
                isSettingDefault: setDefaultNote.isPending,
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
