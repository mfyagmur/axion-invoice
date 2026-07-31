import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { InvoicesPage } from '@/pages/dashboard/InvoicesPage'
import { useInvoices } from '@/features/invoices/hooks/useInvoices'
import { renderWithProviders } from '@/test/renderWithProviders'

vi.mock('@/features/invoices/hooks/useInvoices', () => ({
  useInvoices: vi.fn(),
}))

const mockedUseInvoices = vi.mocked(useInvoices)

describe('InvoicesPage', () => {
  it('shows a loading message while fetching', () => {
    mockedUseInvoices.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useInvoices>)

    renderWithProviders(<InvoicesPage />)
    expect(screen.getByText('Yükleniyor...')).toBeInTheDocument()
  })

  it('shows an empty state when there are no invoices', () => {
    mockedUseInvoices.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useInvoices>)

    renderWithProviders(<InvoicesPage />)
    expect(screen.getByText(/henüz.*fatura|fatura.*yok/i)).toBeInTheDocument()
  })

  it('shows an error state with a retry button that calls refetch', async () => {
    const refetch = vi.fn()
    mockedUseInvoices.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    } as unknown as ReturnType<typeof useInvoices>)

    const user = userEvent.setup()
    renderWithProviders(<InvoicesPage />)

    const retryButton = screen.getByRole('button', { name: /tekrar dene/i })
    await user.click(retryButton)

    expect(refetch).toHaveBeenCalled()
  })
})
