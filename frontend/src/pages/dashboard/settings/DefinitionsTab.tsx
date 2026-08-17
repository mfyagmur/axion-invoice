import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Coins,
  Calendar,
  CalendarClock,
  Settings,
  Wallet,
  Hash,
  Percent,
  CalendarDays,
  Landmark,
  Package,
  Ruler,
  Tags,
  FileText,
} from 'lucide-react'
import { DefinitionCategoryCard, type DefinitionMenuItem } from './definitions/DefinitionCategoryCard'
import { DefinitionPanel } from './definitions/DefinitionPanel'

export function DefinitionsTab() {
  const { t } = useTranslation()
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const systemItems: DefinitionMenuItem[] = [
    { key: 'currency', label: t('settings.definitions.currency'), icon: <Coins size={16} /> },
    { key: 'dateFormat', label: t('settings.definitions.dateFormat'), icon: <Calendar size={16} /> },
    { key: 'taxYearStart', label: t('settings.definitions.taxYearStart'), icon: <CalendarClock size={16} /> },
  ]

  const financeItems: DefinitionMenuItem[] = [
    { key: 'invoiceNumber', label: t('settings.definitions.invoiceNumber'), icon: <Hash size={16} /> },
    { key: 'taxRates', label: t('settings.definitions.taxRates'), icon: <Percent size={16} /> },
    { key: 'paymentTerms', label: t('settings.definitions.paymentTerms'), icon: <CalendarDays size={16} /> },
    { key: 'bankAccounts', label: t('settings.definitions.bankAccounts'), icon: <Landmark size={16} /> },
  ]

  const operationsItems: DefinitionMenuItem[] = [
    { key: 'units', label: t('settings.definitions.units'), icon: <Ruler size={16} /> },
    { key: 'categories', label: t('settings.definitions.categories'), icon: <Tags size={16} /> },
    { key: 'notes', label: t('settings.definitions.fixedNotes'), icon: <FileText size={16} /> },
  ]

  const handleSelect = (key: string) => {
    setActiveKey((current) => (current === key ? null : key))
  }

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DefinitionCategoryCard
          icon={<Settings size={18} />}
          title={t('settings.definitions.systemSettings')}
          items={systemItems}
          activeKey={activeKey}
          onSelect={handleSelect}
        />
        <DefinitionCategoryCard
          icon={<Wallet size={18} />}
          title={t('settings.definitions.financeSettings')}
          items={financeItems}
          activeKey={activeKey}
          onSelect={handleSelect}
        />
        <DefinitionCategoryCard
          icon={<Package size={18} />}
          title={t('settings.definitions.operationsSettings')}
          items={operationsItems}
          activeKey={activeKey}
          onSelect={handleSelect}
        />
      </div>

      <DefinitionPanel activeKey={activeKey} />
    </div>
  )
}
