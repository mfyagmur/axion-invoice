import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/features/auth/api/authApi'
import type { ForgotPasswordPayload } from '@/types/auth'

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authApi.forgotPassword(payload),
  })
}
