import axios, { type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/config/env'
import { useAuthStore } from '@/store/authStore'
import type { TokenResponse } from '@/types/auth'

const NO_REFRESH_PATHS = ['/auth/refresh', '/auth/login', '/auth/signup', '/auth/google']

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return config
})

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

let refreshPromise: Promise<string> | null = null

function shouldSkipRefresh(url: string | undefined): boolean {
  return !url || NO_REFRESH_PATHS.some((path) => url.includes(path))
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const config = error.config as RetriableConfig | undefined
    if (!config || config._retried || shouldSkipRefresh(config.url)) {
      return Promise.reject(error)
    }
    config._retried = true

    try {
      if (!refreshPromise) {
        refreshPromise = apiClient
          .post<TokenResponse>('/auth/refresh')
          .then(({ data }) => data.access_token)
          .finally(() => {
            refreshPromise = null
          })
      }
      const accessToken = await refreshPromise
      useAuthStore.getState().setAccessToken(accessToken)
      config.headers.set('Authorization', `Bearer ${accessToken}`)
      return apiClient(config)
    } catch (refreshError) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    }
  },
)
