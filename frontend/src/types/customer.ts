export interface CustomerContact {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
}

export interface Customer {
  id: string
  name: string
  first_name: string | null
  last_name: string | null
  company_name: string | null
  customer_type: 'bireysel' | 'kurumsal'
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  country: string | null
  website: string | null
  tax_office: string | null
  tax_number: string | null
  fax: string | null
  mersis_no: string | null
  is_active: boolean
  contacts?: CustomerContact[]
}

export interface CustomerCreatePayload {
  first_name: string
  last_name: string
  company_name?: string
  customer_type: 'bireysel' | 'kurumsal'
  email: string
  phone: string
  address: string
  city?: string
  postal_code?: string
  country?: string
  website?: string
  tax_office: string
  tax_number: string
  fax?: string
  mersis_no?: string
}

export type CustomerUpdatePayload = CustomerCreatePayload

export interface CustomerContact {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
}

export interface CustomerContactPayload {
  first_name: string
  last_name: string
  email?: string
  phone?: string
}
