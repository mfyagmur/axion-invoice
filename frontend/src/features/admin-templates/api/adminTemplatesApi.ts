import { apiClient } from '@/lib/apiClient'
import type { TemplateDetail, TemplateSummary, XsltTemplateSavePayload } from '@/types/template'

export const adminTemplatesApi = {
  list: () => apiClient.get<TemplateSummary[]>('/admin/templates').then((res) => res.data),

  createXslt: (payload: XsltTemplateSavePayload) =>
    apiClient.post<TemplateDetail>('/admin/templates/xslt', payload).then((res) => res.data),

  updateXslt: (id: string, payload: XsltTemplateSavePayload) =>
    apiClient.put<TemplateDetail>(`/admin/templates/xslt/${id}`, payload).then((res) => res.data),

  remove: (id: string) => apiClient.delete<void>(`/admin/templates/${id}`).then((res) => res.data),
}
