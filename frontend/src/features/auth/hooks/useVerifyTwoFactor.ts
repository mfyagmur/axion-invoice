import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { applyAuthSuccess } from '@/features/auth/applyAuthSuccess'
import { authApi } from '@/features/auth/api/authApi'
import type { VerifyTwoFactorPayload } from '@/types/auth'

export function useVerifyTwoFactor() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: VerifyTwoFactorPayload) => authApi.verifyTwoFactor(payload),
    onSuccess: async ({ access_token }) => {
      const user = await applyAuthSuccess(access_token)
      navigate(user.is_admin ? '/admin' : '/dashboard')
    },
  })
}
