import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { applyAuthSuccess } from '@/features/auth/applyAuthSuccess'
import { authApi } from '@/features/auth/api/authApi'
import type { GoogleLoginPayload } from '@/types/auth'

export function useGoogleLogin() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: GoogleLoginPayload) => authApi.googleLogin(payload),
    onSuccess: async ({ access_token }) => {
      await applyAuthSuccess(access_token)
      navigate('/dashboard')
    },
  })
}
