import { z } from 'zod'

export const signupSchema = z
  .object({
    email: z.string().email('auth.signup.errors.emailInvalid'),
    password: z.string().min(8, 'auth.signup.errors.passwordMin'),
    confirmPassword: z.string(),
    full_name: z.string().min(1, 'auth.signup.errors.fullNameRequired'),
    account_type: z.enum(['bireysel', 'kurumsal']),
    company_name: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.signup.errors.passwordMismatch',
    path: ['confirmPassword'],
  })
  .refine((data) => data.account_type !== 'kurumsal' || !!data.company_name?.trim(), {
    message: 'auth.signup.errors.companyNameRequired',
    path: ['company_name'],
  })

export type SignupFormValues = z.infer<typeof signupSchema>
