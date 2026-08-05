import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { templatesApi } from '@/features/invoice-editor/api/templatesApi'

export function useCreateXsltTemplate() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: templatesApi.createXslt,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['templates'] })
      navigate('/dashboard/templates')
    },
  })
}
