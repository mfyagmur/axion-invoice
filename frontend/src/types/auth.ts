export type AccountType = 'bireysel' | 'kurumsal'
export type Locale = 'tr' | 'en'

export interface User {
  id: string
  email: string
  full_name: string
  account_type: AccountType
  company_name: string | null
  locale: Locale
  is_demo: boolean
  is_admin: boolean
}

export interface SignupPayload {
  email: string
  password: string
  full_name: string
  account_type: AccountType
  company_name?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface GoogleLoginPayload {
  id_token: string
  account_type: AccountType
}

export interface TokenResponse {
  access_token: string
  token_type: string
}
