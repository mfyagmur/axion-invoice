import axios from 'axios'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useCreateXsltTemplate } from '@/features/invoice-editor/hooks/useCreateXsltTemplate'
import { useToastStore } from '@/store/toastStore'
import type { TemplateFormat } from '@/types/template'

const TARGET_FORMATS: TemplateFormat[] = ['generic', 'e_fatura', 'international', 'e_irsaliye_arsiv']

const FORMAT_LABELS: Record<TemplateFormat, string> = {
  generic: 'Genel',
  e_fatura: 'Türk e-Fatura',
  international: 'Uluslararası',
  e_irsaliye_arsiv: 'e-İrsaliye / e-Arşiv',
}

export function XsltTemplateCreatePage() {
  const { t } = useTranslation()
  const pushToast = useToastStore((state) => state.push)
  const createXsltTemplate = useCreateXsltTemplate()

  const [name, setName] = useState('')
  const [targetFormat, setTargetFormat] = useState<TemplateFormat>('generic')
  const [xsltContent, setXsltContent] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    createXsltTemplate.mutate(
      { name, target_format: targetFormat, xslt_content: xsltContent, fields: {} },
      {
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
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="text-xl font-semibold text-slate-900">Yeni XSLT Şablonu</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <label className="text-sm font-medium text-slate-700">XSLT İçeriği</label>
          <textarea
            value={xsltContent}
            onChange={(e) => setXsltContent(e.target.value)}
            required
            rows={14}
            className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs"
            placeholder="<?xml version='1.0'?><xsl:stylesheet ...>"
          />
        </div>

        <Button type="submit" disabled={createXsltTemplate.isPending}>
          {createXsltTemplate.isPending ? t('common.loading') : t('common.save')}
        </Button>
      </form>
    </div>
  )
}
