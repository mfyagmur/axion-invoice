import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { invoicesApi } from '@/features/invoices/api/invoicesApi'

export function useDownloadInvoicePdf() {
  return useMutation({
    mutationFn: async ({ id, filename }: { id: string; filename: string }) => {
      const blob = await invoicesApi.downloadPdf(id)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    },
    onError: () => {
      toast.error('PDF indirilemedi')
    },
  })
}
