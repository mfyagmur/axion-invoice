import { apiClient } from '@/lib/apiClient'
import type { AccountUpdatePayload, PasswordChangePayload, PreferencesUpdatePayload, ProfileUpdatePayload, User } from '@/types/auth'

export const profileApi = {
  updateProfile: async (payload: ProfileUpdatePayload): Promise<User> => {
    const { data } = await apiClient.patch('/profile', payload)
    return data
  },

  updateAccount: async (payload: AccountUpdatePayload): Promise<User> => {
    const { data } = await apiClient.patch('/profile/account', payload)
    return data
  },

  updatePreferences: async (payload: PreferencesUpdatePayload): Promise<User> => {
    const { data } = await apiClient.patch('/profile/preferences', payload)
    return data
  },

  changePassword: async (payload: PasswordChangePayload): Promise<void> => {
    await apiClient.post('/profile/password', payload)
  },

  uploadLogo: async (file: File): Promise<User> => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await apiClient.post('/profile/account/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  removeLogo: async (): Promise<User> => {
    const { data } = await apiClient.delete('/profile/account/logo')
    return data
  },
}
