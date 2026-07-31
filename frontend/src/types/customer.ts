export interface Customer {
  id: string
  name: string
  email: string | null
  tax_number: string | null
  address: string | null
}

export interface CustomerCreatePayload {
  name: string
  email?: string
  tax_number?: string
  address?: string
}
