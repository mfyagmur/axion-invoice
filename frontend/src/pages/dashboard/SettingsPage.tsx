import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Tabs } from '@/components/Tabs'
import { useAuthStore } from '@/store/authStore'
import { ProfileTab } from './settings/ProfileTab'
import { AccountTab } from './settings/AccountTab'
import { PreferencesTab } from './settings/PreferencesTab'
import { BillingTab } from './settings/BillingTab'
import { SecurityTab } from './settings/SecurityTab'
import { DefinitionsTab } from './settings/DefinitionsTab'

type SettingsTabKey = 'profile' | 'account' | 'preferences' | 'billing' | 'security' | 'definitions'

export function SettingsPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return null
  }

  const activeTab = (searchParams.get('tab') || 'profile') as SettingsTabKey

  const tabItems = [
    { key: 'profile', label: t('settings.tabs.profile') },
    { key: 'account', label: t('settings.tabs.account') },
    { key: 'preferences', label: t('settings.tabs.preferences') },
    { key: 'security', label: t('settings.tabs.security') },
    { key: 'definitions', label: t('settings.tabs.definitions') },
    { key: 'billing', label: t('settings.tabs.billing') },
  ]

  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key })
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />
      case 'account':
        return <AccountTab />
      case 'preferences':
        return <PreferencesTab />
      case 'security':
        return <SecurityTab />
      case 'definitions':
        return <DefinitionsTab />
      case 'billing':
        return <BillingTab />
      default:
        return <ProfileTab />
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-slate-900">{t('nav.settings')}</h1>
      <Tabs items={tabItems} activeKey={activeTab} onChange={handleTabChange} />
      <div>{renderTabContent()}</div>
    </div>
  )
}
