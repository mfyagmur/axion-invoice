import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('auth.signup.errors.emailInvalid'),
  password: z.string().min(1, 'auth.signup.errors.passwordMin'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
