import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/Modal'
import { Tabs } from '@/components/Tabs'
import { useAdminSlowQueryDetails } from '@/features/admin-dashboard/hooks/useAdminSlowQueryDetails'
import type { RequestIssueDetail, SlowQueryAlertKey } from '@/features/admin-dashboard/types/adminDashboard'

const SLOW_REQUEST_THRESHOLD_MS = 500

interface SlowQueryDetailModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab: SlowQueryAlertKey
}

type TabKey = 'requests' | 'errors'

function tabForAlertKey(key: SlowQueryAlertKey): TabKey {
  return key === 'server_errors' ? 'errors' : 'requests'
}

export function SlowQueryDetailModal({ isOpen, onClose, initialTab }: SlowQueryDetailModalProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabKey>(tabForAlertKey(initialTab))
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const { data, isLoading } = useAdminSlowQueryDetails(isOpen)

  if (!isOpen) {
    return null
  }

  const rows: RequestIssueDetail[] = activeTab === 'requests' ? data?.slow_requests ?? [] : data?.server_errors ?? []
  const selected = selectedIndex !== null ? rows[selectedIndex] : undefined

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey)
    setSelectedIndex(null)
  }

  const renderDetail = (row: RequestIssueDetail) => {
    if (row.status_code >= 400) {
      return (
        <div className="rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-800">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            {t('admin.dashboard.system.slowQueryModal.errorCodeLabel')}: {row.status_code}
          </p>
          <p className="mt-1 text-slate-600 dark:text-slate-300">
            {row.error_detail ??
              t('admin.dashboard.system.slowQueryModal.genericErrorText', {
                method: row.method,
                path: row.path,
                status: row.status_code,
              })}
          </p>
        </div>
      )
    }

    return (
      <div className="rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-800">
        <p className="font-semibold text-slate-900 dark:text-slate-100">
          {t('admin.dashboard.system.slowQueryModal.slowReasonLabel')}
        </p>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          {t('admin.dashboard.system.slowQueryModal.slowReasonText', {
            duration: Math.round(row.duration_ms),
            threshold: SLOW_REQUEST_THRESHOLD_MS,
          })}
        </p>
      </div>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('admin.dashboard.system.slowQueryModal.title')} size="xl">
      <div className="flex h-full flex-col gap-3">
        <Tabs
          items={[
            { key: 'requests', label: t('admin.dashboard.system.slowQueryModal.tabRequests') },
            { key: 'errors', label: t('admin.dashboard.system.slowQueryModal.tabErrors') },
          ]}
          activeKey={activeTab}
          onChange={handleTabChange}
        />

        <div className="flex-1 overflow-y-auto">
          {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>}
          {!isLoading && rows.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin.dashboard.system.slowQueryModal.empty')}</p>
          )}
          {!isLoading && rows.length > 0 && (
            <div className="flex flex-col gap-1">
              {rows.map((row, index) => (
                <div key={`${row.timestamp}-${index}`}>
                  <button
                    type="button"
                    onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2 text-left text-sm hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold ${
                          row.status_code >= 400
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {row.method}
                      </span>
                      <span className="truncate text-slate-700 dark:text-slate-300">{row.path}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>{new Date(row.timestamp).toLocaleTimeString()}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{Math.round(row.duration_ms)}ms</span>
                      <span
                        className={row.status_code >= 400 ? 'font-semibold text-red-600 dark:text-red-400' : ''}
                      >
                        {row.status_code}
                      </span>
                    </div>
                  </button>
                  {selected === row && <div className="mt-1 px-3">{renderDetail(row)}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
