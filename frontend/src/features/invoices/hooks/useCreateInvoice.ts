import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { invoicesApi } from '@/features/invoices/api/invoicesApi'

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: invoicesApi.create,
    onSuccess: (invoice) => {
      void queryClient.invalidateQueries({ queryKey: ['invoices'] })
      navigate(`/dashboard/invoices/${invoice.id}`)
    },
  })
}
