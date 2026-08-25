import axios from 'axios'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ErrorState } from '@/components/ErrorState'
import { useMySubscription } from '@/features/billing/hooks/useMySubscription'
import { useDeleteTemplate } from '@/features/invoice-editor/hooks/useDeleteTemplate'
import { useDemoteTemplate } from '@/features/invoice-editor/hooks/useDemoteTemplate'
import { useDuplicateTemplate } from '@/features/invoice-editor/hooks/useDuplicateTemplate'
import { usePromoteTemplate } from '@/features/invoice-editor/hooks/usePromoteTemplate'
import { useTemplates } from '@/features/invoice-editor/hooks/useTemplates'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import type { TemplateFormat, TemplateSummary } from '@/types/template'
import { PLAN_RANK } from '@/utils/planRank'

const FORMAT_LABELS: Record<TemplateFormat, string> = {
  generic: 'Genel',
  e_fatura: 'Türk e-Fatura',
  international: 'Uluslararası',
  e_irsaliye_arsiv: 'e-İrsaliye / e-Arşiv',
}

function TemplateBadges({ template }: { template: TemplateSummary }) {
  return (
    <div className="flex gap-1">
      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs uppercase text-slate-600">
        {template.engine === 'xslt' ? 'XSLT' : 'Visual'}
      </span>
      {template.target_format !== 'generic' && (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
          {FORMAT_LABELS[template.target_format]}
        </span>
      )}
    </div>
  )
}

function TemplateCard({
  template,
  userPlanKey,
  isAdmin,
}: {
  template: TemplateSummary
  userPlanKey: string | undefined
  isAdmin: boolean
}) {
  const { t } = useTranslation()
  const [demoteDialogOpen, setDemoteDialogOpen] = useState(false)
  const duplicateTemplate = useDuplicateTemplate()
  const deleteTemplate = useDeleteTemplate()
  const promoteTemplate = usePromoteTemplate()
  const demoteTemplate = useDemoteTemplate()
  const pushToast = useToastStore((state) => state.push)

  const isBlocked =
    template.min_plan_key != null &&
    (PLAN_RANK[userPlanKey ?? 'free'] ?? 0) < (PLAN_RANK[template.min_plan_key] ?? 0)

  return (
    <>
      <div className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">{template.name}</span>
          <TemplateBadges template={template} />
        </div>
        <div className="flex gap-2">
          {template.is_system_template ? (
            <>
              <Button
                variant="secondary"
                className={isBlocked ? 'opacity-60' : undefined}
                onClick={() => {
                  if (isBlocked) {
                    pushToast(t('templates.list.freeUseBlocked'))
                    return
                  }
                  duplicateTemplate.mutate(template.id)
                }}
              >
                {t('templates.list.use')}
              </Button>
              {isAdmin && template.engine === 'visual' && (
                <Button variant="ghost" onClick={() => setDemoteDialogOpen(true)}>
                  {t('templates.list.demoteFromSystem')}
                </Button>
              )}
            </>
          ) : (
            <>
              <Link to={`/dashboard/templates/${template.id}/edit`}>
                <Button variant="secondary">{t('templates.list.edit')}</Button>
              </Link>
              {isAdmin && template.engine === 'visual' && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    promoteTemplate.mutate(template.id, {
                      onError: (error: unknown) => {
                        const message = axios.isAxiosError(error)
                          ? ((error.response?.data as { detail?: string } | undefined)?.detail ??
                              t('common.error'))
                          : t('common.error')
                        pushToast(message)
                      },
                    })
                  }}
                >
                  {t('templates.list.promoteToSystem')}
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => {
                  if (window.confirm(t('templates.list.deleteConfirm'))) {
                    deleteTemplate.mutate(template.id)
                  }
                }}
              >
                <Trash2 size={16} />
              </Button>
            </>
          )}
        </div>
      </div>
      <ConfirmDialog
        isOpen={demoteDialogOpen}
        title={t('templates.list.demoteTitle')}
        message={t('templates.list.demoteConfirm')}
        confirmLabel={t('templates.list.demoteConfirmBtn')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        onConfirm={() => {
          setDemoteDialogOpen(false)
          demoteTemplate.mutate(template.id, {
            onError: (error: unknown) => {
              const message = axios.isAxiosError(error)
                ? ((error.response?.data as { detail?: string } | undefined)?.detail ??
                    t('common.error'))
                : t('common.error')
              pushToast(message)
            },
          })
        }}
        onCancel={() => setDemoteDialogOpen(false)}
      />
    </>
  )
}

export function TemplatesPage() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const { data: templates, isLoading, isError, refetch } = useTemplates()
  const { data: subscription } = useMySubscription()

  const systemTemplates = templates?.filter((template) => template.is_system_template && template.is_active !== false) ?? []
  const ownTemplates = templates?.filter((template) => !template.is_system_template) ?? []
  const isAdmin = user?.is_admin ?? false

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">{t('nav.templates')}</h1>
        <div className="flex gap-2">
          <Link to="/dashboard/templates/new">
            <Button>
              <Plus size={16} className="mr-1" />
              {t('templates.list.newTemplate')}
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && <p className="text-sm text-slate-500">{t('common.loading')}</p>}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-slate-700">{t('templates.list.sectionSystem')}</h2>
            <div className="flex flex-col gap-2">
              {systemTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  userPlanKey={subscription?.plan.key}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-slate-700">{t('templates.list.sectionMine')}</h2>
            {ownTemplates.length === 0 ? (
              <p className="text-sm text-slate-500">{t('templates.list.empty')}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {ownTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    userPlanKey={subscription?.plan.key}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
