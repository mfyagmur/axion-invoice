import { apiClient } from '@/lib/apiClient'
import type { TwoFactorEmailConfirmPayload, TwoFactorEmailSetupPayload, TwoFactorTogglePayload, User } from '@/types/auth'

export const twoFactorApi = {
  setupEmail: (payload: TwoFactorEmailSetupPayload) =>
    apiClient.post<void>('/2fa/email/setup', payload).then((res) => res.data),

  confirmEmail: (payload: TwoFactorEmailConfirmPayload) =>
    apiClient.post<User>('/2fa/email/confirm', payload).then((res) => res.data),

  toggle: (payload: TwoFactorTogglePayload) =>
    apiClient.post<User>('/2fa/toggle', payload).then((res) => res.data),
}
