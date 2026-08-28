import { z } from 'zod'

export const forgotPasswordSchema = z.object({
  email: z.string().email('auth.signup.errors.emailInvalid'),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
