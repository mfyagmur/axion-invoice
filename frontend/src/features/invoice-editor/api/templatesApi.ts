import { apiClient } from '@/lib/apiClient'
import type { TemplateDetail, TemplateSavePayload, TemplateSummary } from '@/types/template'

export const templatesApi = {
  list: () => apiClient.get<TemplateSummary[]>('/templates').then((res) => res.data),

  get: (id: string) => apiClient.get<TemplateDetail>(`/templates/${id}`).then((res) => res.data),

  create: (payload: TemplateSavePayload) =>
    apiClient.post<TemplateDetail>('/templates', payload).then((res) => res.data),

  update: (id: string, payload: TemplateSavePayload) =>
    apiClient.put<TemplateDetail>(`/templates/${id}`, payload).then((res) => res.data),

  remove: (id: string) => apiClient.delete<void>(`/templates/${id}`).then((res) => res.data),

  duplicate: (id: string) =>
    apiClient.post<TemplateDetail>(`/templates/${id}/duplicate`).then((res) => res.data),
}
