export type AccountType = 'bireysel' | 'kurumsal'
export type Locale = 'tr' | 'en'

export interface User {
  id: string
  email: string
  full_name: string
  account_type: AccountType
  company_name: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  country: string | null
  phone: string | null
  tax_office: string | null
  tax_number: string | null
  sector: string | null
  trade_registry_no: string | null
  corporate_email: string | null
  locale: Locale
  notify_invoice_reminders: boolean
  notify_product_updates: boolean
  notify_billing_emails: boolean
  is_demo: boolean
  is_admin: boolean
  has_password: boolean
  created_at: string
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

export interface ProfileUpdatePayload {
  full_name: string
}

export interface AccountUpdatePayload {
  company_name?: string | null
  address?: string | null
  city?: string | null
  postal_code?: string | null
  country?: string | null
  phone?: string | null
  tax_office?: string | null
  tax_number?: string | null
  sector?: string | null
  trade_registry_no?: string | null
  corporate_email?: string | null
}

export interface PreferencesUpdatePayload {
  locale?: Locale
  notify_invoice_reminders?: boolean
  notify_product_updates?: boolean
  notify_billing_emails?: boolean
}

export interface PasswordChangePayload {
  current_password?: string
  new_password: string
  confirm_password: string
}
