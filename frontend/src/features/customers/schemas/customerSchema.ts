import { z } from 'zod'

export const customerSchema = z.object({
  name: z.string().min(1, 'customers.form.errors.nameRequired'),
  email: z.string().min(1, 'customers.form.errors.emailRequired').email('customers.form.errors.emailInvalid'),
  address: z.string().min(1, 'customers.form.errors.addressRequired'),
  phone: z.string().min(1, 'customers.form.errors.phoneRequired'),
  tax_office: z.string().min(1, 'customers.form.errors.taxOfficeRequired'),
  tax_number: z.string().min(1, 'customers.form.errors.taxNumberRequired'),
  fax: z.string().optional(),
  mersis_no: z.string().optional(),
})

export type CustomerFormValues = z.infer<typeof customerSchema>
