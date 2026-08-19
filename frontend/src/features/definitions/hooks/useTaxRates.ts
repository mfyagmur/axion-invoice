import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToastStore } from '@/store/toastStore'
import { definitionsApi } from '../api/definitionsApi'
import type { TaxRatePayload } from '@/types/definitions'

export const useTaxRates = () => {
  return useQuery({
    queryKey: ['definitions', 'taxRates'],
    queryFn: () => definitionsApi.taxRates.list(),
  })
}

export const useCreateTaxRate = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (payload: TaxRatePayload) => definitionsApi.taxRates.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'taxRates'] })
      pushToast('KDV oranı oluşturuldu', 'success')
    },
    onError: () => {
      pushToast('KDV oranı oluşturulamadı')
    },
  })
}

export const useUpdateTaxRate = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaxRatePayload }) =>
      definitionsApi.taxRates.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'taxRates'] })
      pushToast('KDV oranı güncellendi', 'success')
    },
    onError: () => {
      pushToast('KDV oranı güncellenirken hata oluştu')
    },
  })
}

export const useDeleteTaxRate = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (id: string) => definitionsApi.taxRates.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'taxRates'] })
      pushToast('KDV oranı silindi', 'success')
    },
    onError: () => {
      pushToast('KDV oranı silinirken hata oluştu')
    },
  })
}

export const useToggleTaxRateStatus = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (id: string) => definitionsApi.taxRates.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'taxRates'] })
      pushToast('KDV oranı durumu değiştirildi', 'success')
    },
    onError: () => {
      pushToast('KDV oranı durumu değiştirilirken hata oluştu')
    },
  })
}

export const useSetDefaultTaxRate = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (id: string) => definitionsApi.taxRates.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'taxRates'] })
      pushToast('Varsayılan KDV oranı ayarlandı', 'success')
    },
    onError: () => {
      pushToast('Varsayılan KDV oranı ayarlanırken hata oluştu')
    },
  })
}
