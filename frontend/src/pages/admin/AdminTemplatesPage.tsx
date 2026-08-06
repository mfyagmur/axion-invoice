import axios from 'axios'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { ErrorState } from '@/components/ErrorState'
import { Input } from '@/components/Input'
import { useAdminTemplates } from '@/features/admin-templates/hooks/useAdminTemplates'
import { useCreateXsltTemplate } from '@/features/admin-templates/hooks/useCreateXsltTemplate'
import { useDeleteAdminTemplate } from '@/features/admin-templates/hooks/useDeleteAdminTemplate'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import type { TemplateFormat } from '@/types/template'

const TARGET_FORMATS: TemplateFormat[] = ['generic', 'e_fatura', 'international', 'e_irsaliye_arsiv']
const MIN_PLAN_OPTIONS = ['', 'free', 'pro', 'business'] as const

const FORMAT_LABELS: Record<TemplateFormat, string> = {
  generic: 'Genel',
  e_fatura: 'Türk e-Fatura',
  international: 'Uluslararası',
  e_irsaliye_arsiv: 'e-İrsaliye / e-Arşiv',
}

const MIN_PLAN_LABELS: Record<(typeof MIN_PLAN_OPTIONS)[number], string> = {
  '': 'Tüm planlar',
  'free': 'Free ve üzeri',
  'pro': 'Pro ve üzeri',
  'business': 'Sadece Business',
}

export function AdminTemplatesPage() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const pushToast = useToastStore((state) => state.push)
  const { data: templates, isLoading, isError, refetch } = useAdminTemplates()
  const createXsltTemplate = useCreateXsltTemplate()
  const deleteTemplate = useDeleteAdminTemplate()

  const [name, setName] = useState('')
  const [targetFormat, setTargetFormat] = useState<TemplateFormat>('generic')
  const [minPlanKey, setMinPlanKey] = useState<(typeof MIN_PLAN_OPTIONS)[number]>('')
  const [xsltContent, setXsltContent] = useState('')

  if (!user?.is_admin) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    createXsltTemplate.mutate(
      {
        name,
        target_format: targetFormat,
        xslt_content: xsltContent,
        fields: {},
        min_plan_key: minPlanKey || null,
      },
      {
        onSuccess: () => {
          pushToast('Şablon oluşturuldu', 'success')
          setName('')
          setXsltContent('')
          setMinPlanKey('')
          setTargetFormat('generic')
        },
        onError: (error: unknown) => {
          const message = axios.isAxiosError(error)
            ? ((error.response?.data as { detail?: string } | undefined)?.detail ?? 'Şablon oluşturulamadı')
            : 'Şablon oluşturulamadı'
          pushToast(message)
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold text-slate-900">Admin — XSLT Şablonları</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-md border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-700">Yeni Sistem Şablonu</h2>

        <Input label="Şablon Adı" value={name} onChange={(e) => setName(e.target.value)} required />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Hedef Format</label>
          <select
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value as TemplateFormat)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {TARGET_FORMATS.map((format) => (
              <option key={format} value={format}>
                {FORMAT_LABELS[format]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Minimum Plan</label>
          <select
            value={minPlanKey}
            onChange={(e) => setMinPlanKey(e.target.value as (typeof MIN_PLAN_OPTIONS)[number])}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {MIN_PLAN_OPTIONS.map((plan) => (
              <option key={plan} value={plan}>
                {MIN_PLAN_LABELS[plan]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">XSLT İçeriği</label>
          <textarea
            value={xsltContent}
            onChange={(e) => setXsltContent(e.target.value)}
            required
            rows={12}
            className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs"
            placeholder="<?xml version='1.0'?><xsl:stylesheet ...>"
          />
        </div>

        <Button type="submit" disabled={createXsltTemplate.isPending}>
          {createXsltTemplate.isPending ? t('common.loading') : t('common.save')}
        </Button>
      </form>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-700">Mevcut Sistem Şablonları</h2>

        {isLoading && <p className="text-sm text-slate-500">{t('common.loading')}</p>}
        {isError && <ErrorState onRetry={() => refetch()} />}

        {!isLoading && !isError && (
          <div className="flex flex-col gap-2">
            {(templates ?? []).map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{template.name}</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs uppercase text-slate-600">
                    {template.engine}
                  </span>
                  {template.target_format !== 'generic' && (
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {FORMAT_LABELS[template.target_format]}
                    </span>
                  )}
                  {template.min_plan_key && (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                      min: {template.min_plan_key}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (window.confirm('Bu şablonu silmek istediğinize emin misiniz?')) {
                      deleteTemplate.mutate(template.id)
                    }
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
