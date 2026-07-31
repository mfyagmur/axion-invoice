import { apiClient } from '@/lib/apiClient'
import type {
  GoogleLoginPayload,
  LoginPayload,
  SignupPayload,
  TokenResponse,
  User,
} from '@/types/auth'

export const authApi = {
  signup: (payload: SignupPayload) =>
    apiClient.post<TokenResponse>('/auth/signup', payload).then((res) => res.data),

  login: (payload: LoginPayload) =>
    apiClient.post<TokenResponse>('/auth/login', payload).then((res) => res.data),

  refresh: () => apiClient.post<TokenResponse>('/auth/refresh').then((res) => res.data),

  logout: () => apiClient.post<void>('/auth/logout').then((res) => res.data),

  demo: () => apiClient.post<TokenResponse>('/auth/demo').then((res) => res.data),

  googleLogin: (payload: GoogleLoginPayload) =>
    apiClient.post<TokenResponse>('/auth/google', payload).then((res) => res.data),

  me: () => apiClient.get<User>('/auth/me').then((res) => res.data),
}
