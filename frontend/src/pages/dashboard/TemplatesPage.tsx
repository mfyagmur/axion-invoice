import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { ErrorState } from '@/components/ErrorState'
import { useMySubscription } from '@/features/billing/hooks/useMySubscription'
import { useDeleteTemplate } from '@/features/invoice-editor/hooks/useDeleteTemplate'
import { useDuplicateTemplate } from '@/features/invoice-editor/hooks/useDuplicateTemplate'
import { useTemplates } from '@/features/invoice-editor/hooks/useTemplates'
import { useToastStore } from '@/store/toastStore'
import type { TemplateSummary } from '@/types/template'

function TemplateCard({ template, isFreePlan }: { template: TemplateSummary; isFreePlan: boolean }) {
  const { t } = useTranslation()
  const duplicateTemplate = useDuplicateTemplate()
  const deleteTemplate = useDeleteTemplate()
  const pushToast = useToastStore((state) => state.push)

  return (
    <div className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3">
      <span className="font-medium text-slate-900">{template.name}</span>
      <div className="flex gap-2">
        {template.is_system_template ? (
          <Button
            variant="secondary"
            className={isFreePlan ? 'opacity-60' : undefined}
            onClick={() => {
              if (isFreePlan) {
                pushToast(t('templates.list.freeUseBlocked'))
                return
              }
              duplicateTemplate.mutate(template.id)
            }}
          >
            {t('templates.list.use')}
          </Button>
        ) : (
          <>
            <Link to={`/dashboard/templates/${template.id}/edit`}>
              <Button variant="secondary">{t('templates.list.edit')}</Button>
            </Link>
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
  )
}

export function TemplatesPage() {
  const { t } = useTranslation()
  const { data: templates, isLoading, isError, refetch } = useTemplates()
  const { data: subscription } = useMySubscription()
  const isFreePlan = subscription?.plan.key === 'free'

  const systemTemplates = templates?.filter((template) => template.is_system_template) ?? []
  const ownTemplates = templates?.filter((template) => !template.is_system_template) ?? []

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">{t('nav.templates')}</h1>
        <Link to="/dashboard/templates/new">
          <Button>
            <Plus size={16} className="mr-1" />
            {t('templates.list.newTemplate')}
          </Button>
        </Link>
      </div>

      {isLoading && <p className="text-sm text-slate-500">{t('common.loading')}</p>}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-slate-700">{t('templates.list.sectionSystem')}</h2>
            <div className="flex flex-col gap-2">
              {systemTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} isFreePlan={isFreePlan} />
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
                  <TemplateCard key={template.id} template={template} isFreePlan={isFreePlan} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
