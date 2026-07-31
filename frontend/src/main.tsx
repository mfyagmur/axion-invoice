import '@/i18n/config'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { App } from '@/App'
import { env } from '@/config/env'
import { router } from '@/routes'
import '@/index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={env.googleClientId ?? ''}>
        <App>
          <RouterProvider router={router} />
        </App>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
