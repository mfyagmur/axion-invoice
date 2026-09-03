export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined,
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'destek@axioninvoice.app',
} as const
