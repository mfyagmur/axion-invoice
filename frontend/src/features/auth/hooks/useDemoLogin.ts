import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { applyAuthSuccess } from '@/features/auth/applyAuthSuccess'
import { authApi } from '@/features/auth/api/authApi'

export function useDemoLogin() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => authApi.demo(),
    onSuccess: async ({ access_token }) => {
      await applyAuthSuccess(access_token)
      navigate('/dashboard')
    },
  })
}
