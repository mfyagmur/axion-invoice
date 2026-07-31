import axios from 'axios'

export function getInvoiceErrorKey(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 402) {
    return 'invoices.form.limitReached'
  }
  return 'common.genericError'
}
