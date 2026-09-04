import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { applyAuthSuccess } from '@/features/auth/applyAuthSuccess'
import { authApi } from '@/features/auth/api/authApi'
import type { LoginPayload } from '@/types/auth'

export function useLogin() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async (data) => {
      if (data.requires_2fa || !data.access_token) return
      const user = await applyAuthSuccess(data.access_token)
      navigate(user.is_admin ? '/admin' : '/dashboard')
    },
  })
}
