import { GoogleLogin } from '@react-oauth/google'
import { useTranslation } from 'react-i18next'
import { env } from '@/config/env'
import { useGoogleLogin } from '@/features/auth/hooks/useGoogleLogin'
import type { AccountType } from '@/types/auth'

interface GoogleLoginButtonProps {
  accountType: AccountType
}

export function GoogleLoginButton({ accountType }: GoogleLoginButtonProps) {
  const { t } = useTranslation()
  const googleLogin = useGoogleLogin()

  if (!env.googleClientId) {
    return null
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse.credential) {
            googleLogin.mutate({
              id_token: credentialResponse.credential,
              account_type: accountType,
            })
          }
        }}
        text="continue_with"
      />
      <span className="sr-only">{t('auth.google.button')}</span>
    </div>
  )
}
