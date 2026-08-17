import { z } from 'zod'

function isValidTCKN(value: string): boolean {
  if (!value || value.length !== 11 || !/^\d+$/.test(value)) {
    return false
  }
  if (value[0] === '0') {
    return false
  }
  const digits = value.split('').map(Number)
  const digit10 = ((digits.slice(0, 9).reduce((sum, d, i) => sum + (i % 2 === 0 ? d * 7 : -d), 0)) % 10 + 10) % 10
  const digit11 = digits.slice(0, 10).reduce((sum, d) => sum + d, 0) % 10
  return digit10 === digits[9] && digit11 === digits[10]
}

export const customerSchema = z
  .object({
    first_name: z.string().min(1, 'customers.form.errors.firstNameRequired'),
    last_name: z.string().min(1, 'customers.form.errors.lastNameRequired'),
    company_name: z.string().optional(),
    customer_type: z.enum(['bireysel', 'kurumsal']),
    email: z.string().min(1, 'customers.form.errors.emailRequired').email('customers.form.errors.emailInvalid'),
    phone: z.string().min(1, 'customers.form.errors.phoneRequired'),
    address: z.string().min(1, 'customers.form.errors.addressRequired'),
    city: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
    website: z.string().optional(),
    tax_office: z.string().optional(),
    tax_number: z.string().min(1, 'customers.form.errors.taxNumberRequired'),
    fax: z.string().optional(),
    mersis_no: z.string().optional(),
  })
  .refine((data) => data.customer_type !== 'kurumsal' || !!data.company_name?.trim(), {
    message: 'customers.form.errors.companyNameRequired',
    path: ['company_name'],
  })
  .refine((data) => data.customer_type !== 'kurumsal' || !!data.tax_office?.trim(), {
    message: 'customers.form.errors.taxOfficeRequired',
    path: ['tax_office'],
  })
  .refine((data) => data.customer_type !== 'bireysel' || isValidTCKN(data.tax_number), {
    message: 'customers.form.errors.nationalIdInvalid',
    path: ['tax_number'],
  })

export type CustomerFormValues = z.infer<typeof customerSchema>
