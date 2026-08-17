import { useTranslation } from 'react-i18next'
import { Input } from '@/components/Input'
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
} from '@/features/definitions/hooks/useNotes'
import { DefinitionListSection } from '../DefinitionListSection'
import { CompanyScalarSettingForm, type ScalarSettingKey } from './CompanyScalarSettingForm'

const SCALAR_KEYS: ScalarSettingKey[] = ['currency', 'dateFormat', 'taxYearStart', 'invoiceNumber']

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

  const { data: taxRates, isLoading: taxRatesLoading } = useTaxRates()
  const createTaxRate = useCreateTaxRate()
  const updateTaxRate = useUpdateTaxRate()
  const deleteTaxRate = useDeleteTaxRate()
  const toggleTaxRateStatus = useToggleTaxRateStatus()

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

  const isOpen = activeKey !== null

  return (
    <div
      className="grid transition-[grid-template-rows] duration-300 ease-in-out"
      style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
    >
      <div className="overflow-hidden">
        <div className="mt-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          {activeKey && SCALAR_KEYS.includes(activeKey as ScalarSettingKey) && (
            <CompanyScalarSettingForm settingKey={activeKey as ScalarSettingKey} />
          )}

          {activeKey === 'units' && (
            <DefinitionListSection
              title={t('settings.definitions.units')}
              items={units || []}
              isLoading={unitsLoading}
              onCreate={(payload) => createUnit.mutate(payload)}
              onUpdate={(id, payload) => updateUnit.mutate({ id, payload })}
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
            />
          )}

          {activeKey === 'taxRates' && (
            <DefinitionListSection
              title={t('settings.definitions.taxRates')}
              items={taxRates || []}
              isLoading={taxRatesLoading}
              onCreate={(payload) => createTaxRate.mutate(payload)}
              onUpdate={(id, payload) => updateTaxRate.mutate({ id, payload })}
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
            />
          )}

          {activeKey === 'paymentTerms' && (
            <DefinitionListSection
              title={t('settings.definitions.paymentTerms')}
              items={paymentTerms || []}
              isLoading={paymentTermsLoading}
              onCreate={(payload) => createPaymentTerm.mutate(payload)}
              onUpdate={(id, payload) => updatePaymentTerm.mutate({ id, payload })}
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
              onCreate={(payload) => createCategory.mutate(payload)}
              onUpdate={(id, payload) => updateCategory.mutate({ id, payload })}
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
              onCreate={(payload) => createBankAccount.mutate(payload)}
              onUpdate={(id, payload) => updateBankAccount.mutate({ id, payload })}
              onDelete={(id) => deleteBankAccount.mutate(id)}
              onToggleStatus={(id) => toggleBankAccountStatus.mutate(id)}
              isCreating={createBankAccount.isPending}
              isUpdating={updateBankAccount.isPending}
              isDeleting={deleteBankAccount.isPending}
              isToggling={toggleBankAccountStatus.isPending}
              fields={['bank_name', 'iban', 'account_holder']}
              renderFields={(values, setValue) => (
                <>
                  <Input
                    label={t('settings.definitions.bankName')}
                    placeholder="e.g., Ziraat Bankası"
                    value={values.bank_name ?? ''}
                    onChange={(e) => setValue('bank_name', e.target.value)}
                  />
                  <Input
                    label={t('settings.definitions.iban')}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    value={values.iban ?? ''}
                    onChange={(e) => setValue('iban', e.target.value)}
                  />
                  <Input
                    label={t('settings.definitions.accountHolder')}
                    placeholder="e.g., Axion Yazılım A.Ş."
                    value={values.account_holder ?? ''}
                    onChange={(e) => setValue('account_holder', e.target.value)}
                  />
                </>
              )}
              buildPayload={(values) => ({
                bank_name: values.bank_name,
                iban: values.iban,
                account_holder: values.account_holder,
              })}
              getEditValues={(item) => ({
                bank_name: item.bank_name ?? '',
                iban: item.iban ?? '',
                account_holder: item.account_holder ?? '',
              })}
              formatValue={(item) => `${item.bank_name} — ${item.iban}`}
            />
          )}

          {activeKey === 'notes' && (
            <DefinitionListSection
              title={t('settings.definitions.fixedNotes')}
              items={notes || []}
              isLoading={notesLoading}
              onCreate={(payload) => createNote.mutate(payload)}
              onUpdate={(id, payload) => updateNote.mutate({ id, payload })}
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
                  <Input
                    label={t('settings.definitions.noteContent')}
                    placeholder="e.g., Bizi tercih ettiğiniz için teşekkür ederiz."
                    value={values.content ?? ''}
                    onChange={(e) => setValue('content', e.target.value)}
                  />
                </>
              )}
              buildPayload={(values) => ({ label: values.label, content: values.content })}
              getEditValues={(item) => ({ label: item.label ?? '', content: item.content ?? '' })}
              formatValue={(item) => item.label || ''}
            />
          )}
        </div>
      </div>
    </div>
  )
}
