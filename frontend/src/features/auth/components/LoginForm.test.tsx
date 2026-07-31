import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { authApi } from '@/features/auth/api/authApi'
import { renderWithProviders } from '@/test/renderWithProviders'

vi.mock('@/features/auth/api/authApi', () => ({
  authApi: {
    login: vi.fn(),
  },
}))

describe('LoginForm', () => {
  it('shows a validation error and does not call the API for an invalid email', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText(/e-posta/i), 'not-an-email')
    await user.type(screen.getByLabelText(/şifre/i), 'somepassword')
    await user.click(screen.getByRole('button', { name: /giriş yap/i }))

    await waitFor(() => {
      expect(authApi.login).not.toHaveBeenCalled()
    })
  })

  it('calls the login API with form values on valid submit', async () => {
    vi.mocked(authApi.login).mockRejectedValueOnce(new Error('network down'))
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText(/e-posta/i), 'user@example.com')
    await user.type(screen.getByLabelText(/şifre/i), 'somepassword')
    await user.click(screen.getByRole('button', { name: /giriş yap/i }))

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({ email: 'user@example.com', password: 'somepassword' })
    })
  })

  it('shows an error message when login fails', async () => {
    vi.mocked(authApi.login).mockRejectedValueOnce(new Error('invalid credentials'))
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText(/e-posta/i), 'user@example.com')
    await user.type(screen.getByLabelText(/şifre/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /giriş yap/i }))

    expect(await screen.findByText(/bir hata oluştu|invalid|hatalı/i)).toBeInTheDocument()
  })
})
