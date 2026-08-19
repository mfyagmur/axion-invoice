export interface DefinitionUnit {
  id: string
  name: string
  is_active: boolean
  is_default: boolean
  created_at: string
}

export interface UnitPayload {
  name: string
  is_active?: boolean
}

export interface DefinitionTaxRate {
  id: string
  label: string
  rate: number
  is_active: boolean
  is_default: boolean
  created_at: string
}

export interface TaxRatePayload {
  label: string
  rate: number
  is_active?: boolean
}

export interface DefinitionPaymentTerm {
  id: string
  label: string
  days: number
  is_active: boolean
  created_at: string
}

export interface PaymentTermPayload {
  label: string
  days: number
  is_active?: boolean
}

export interface DefinitionCategory {
  id: string
  name: string
  is_active: boolean
  created_at: string
}

export interface CategoryPayload {
  name: string
  is_active?: boolean
}

export interface DefinitionBankAccount {
  id: string
  bank_name: string
  branch_name: string
  branch_code: string
  currency: string
  account_number: string
  iban: string
  is_active: boolean
  created_at: string
}

export interface BankAccountPayload {
  bank_name: string
  branch_name: string
  branch_code: string
  currency: string
  account_number: string
  iban: string
  is_active?: boolean
}

export interface DefinitionNote {
  id: string
  label: string
  content: string
  is_active: boolean
  is_default: boolean
  created_at: string
}

export interface NotePayload {
  label: string
  content: string
  is_active?: boolean
}
