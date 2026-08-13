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
import { DefinitionListSection } from './DefinitionListSection'

export function DefinitionsTab() {
  const { t } = useTranslation()

  // Units
  const { data: units, isLoading: unitsLoading } = useUnits()
  const createUnit = useCreateUnit()
  const updateUnit = useUpdateUnit()
  const deleteUnit = useDeleteUnit()
  const toggleUnitStatus = useToggleUnitStatus()

  // Tax Rates
  const { data: taxRates, isLoading: taxRatesLoading } = useTaxRates()
  const createTaxRate = useCreateTaxRate()
  const updateTaxRate = useUpdateTaxRate()
  const deleteTaxRate = useDeleteTaxRate()
  const toggleTaxRateStatus = useToggleTaxRateStatus()

  // Payment Terms
  const { data: paymentTerms, isLoading: paymentTermsLoading } = usePaymentTerms()
  const createPaymentTerm = useCreatePaymentTerm()
  const updatePaymentTerm = useUpdatePaymentTerm()
  const deletePaymentTerm = useDeletePaymentTerm()
  const togglePaymentTermStatus = useTogglePaymentTermStatus()

  // Categories
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const toggleCategoryStatus = useToggleCategoryStatus()

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
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
    </div>
  )
}
