import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { templatesApi } from '@/features/invoice-editor/api/templatesApi'

export function useDuplicateTemplate() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (id: string) => templatesApi.duplicate(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['templates'] })
      navigate(`/dashboard/templates/${data.id}/edit`)
    },
  })
}
