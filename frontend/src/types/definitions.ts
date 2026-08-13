export interface DefinitionUnit {
  id: string
  name: string
  is_active: boolean
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
