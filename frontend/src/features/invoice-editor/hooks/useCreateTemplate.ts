import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { templatesApi } from '@/features/invoice-editor/api/templatesApi'

export function useCreateTemplate() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: templatesApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['templates'] })
      navigate('/dashboard/templates')
    },
  })
}
