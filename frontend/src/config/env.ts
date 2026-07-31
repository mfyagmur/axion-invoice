export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined,
} as const
