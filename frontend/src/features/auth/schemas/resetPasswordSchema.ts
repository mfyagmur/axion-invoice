import { z } from 'zod'

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'auth.signup.errors.passwordMin'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.signup.errors.passwordMismatch',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
