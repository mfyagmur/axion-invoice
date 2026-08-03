import { screen } from '@testing-library/react'
import axios from 'axios'
import { describe, expect, it, vi } from 'vitest'
import { InvoiceForm } from '@/features/invoices/components/InvoiceForm'
import { useCreateInvoice } from '@/features/invoices/hooks/useCreateInvoice'
import { useCustomers } from '@/features/customers/hooks/useCustomers'
import { useTemplates } from '@/features/invoice-editor/hooks/useTemplates'
import { useTemplate } from '@/features/invoice-editor/hooks/useTemplate'
import { renderWithProviders } from '@/test/renderWithProviders'

vi.mock('@/features/invoices/hooks/useCreateInvoice', () => ({ useCreateInvoice: vi.fn() }))
vi.mock('@/features/customers/hooks/useCustomers', () => ({ useCustomers: vi.fn() }))
vi.mock('@/features/invoice-editor/hooks/useTemplates', () => ({ useTemplates: vi.fn() }))
vi.mock('@/features/invoice-editor/hooks/useTemplate', () => ({ useTemplate: vi.fn() }))

function make402Error() {
  const error = new Error('Limit exceeded') as Error & { isAxiosError: boolean; response: unknown }
  error.isAxiosError = true
  error.response = { status: 402 }
  return error
}

describe('InvoiceForm', () => {
  it('shows the limit-reached message with a billing link when creation fails with 402', () => {
    vi.mocked(useTemplates).mockReturnValue({ data: [] } as unknown as ReturnType<typeof useTemplates>)
    vi.mocked(useCustomers).mockReturnValue({ data: [] } as unknown as ReturnType<typeof useCustomers>)
    vi.mocked(useTemplate).mockReturnValue({ data: undefined } as unknown as ReturnType<typeof useTemplate>)
    vi.mocked(useCreateInvoice).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: true,
      error: make402Error(),
    } as unknown as ReturnType<typeof useCreateInvoice>)

    renderWithProviders(<InvoiceForm />)

    expect(axios.isAxiosError(make402Error())).toBe(true)
    expect(screen.getByText(/aylık fatura limitinize ulaştınız|limit/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /faturalama/i })).toHaveAttribute(
      'href',
      '/dashboard/billing',
    )
  })
})
