import { z } from 'zod'

export const customerSchema = z.object({
  first_name: z.string().min(1, 'customers.form.errors.firstNameRequired'),
  last_name: z.string().min(1, 'customers.form.errors.lastNameRequired'),
  company_name: z.string().optional(),
  email: z.string().min(1, 'customers.form.errors.emailRequired').email('customers.form.errors.emailInvalid'),
  phone: z.string().min(1, 'customers.form.errors.phoneRequired'),
  address: z.string().min(1, 'customers.form.errors.addressRequired'),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  website: z.string().optional(),
  tax_office: z.string().min(1, 'customers.form.errors.taxOfficeRequired'),
  tax_number: z.string().min(1, 'customers.form.errors.taxNumberRequired'),
  fax: z.string().optional(),
  mersis_no: z.string().optional(),
})

export type CustomerFormValues = z.infer<typeof customerSchema>
