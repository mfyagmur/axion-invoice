export interface Customer {
  id: string
  name: string
  email: string | null
  address: string | null
  phone: string | null
  tax_office: string | null
  tax_number: string | null
  fax: string | null
  mersis_no: string | null
  is_active: boolean
}

export interface CustomerCreatePayload {
  name: string
  email: string
  address: string
  phone: string
  tax_office: string
  tax_number: string
  fax?: string
  mersis_no?: string
}

export type CustomerUpdatePayload = CustomerCreatePayload

export interface InvoiceCustomerPayload {
  name: string
  email?: string
  tax_number?: string
  address?: string
}
