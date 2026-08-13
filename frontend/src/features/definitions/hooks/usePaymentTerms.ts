import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToastStore } from '@/store/toastStore'
import { definitionsApi } from '../api/definitionsApi'
import type { PaymentTermPayload } from '@/types/definitions'

export const usePaymentTerms = () => {
  return useQuery({
    queryKey: ['definitions', 'paymentTerms'],
    queryFn: () => definitionsApi.paymentTerms.list(),
  })
}

export const useCreatePaymentTerm = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (payload: PaymentTermPayload) => definitionsApi.paymentTerms.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'paymentTerms'] })
      pushToast('Ödeme vadesi oluşturuldu', 'success')
    },
    onError: () => {
      pushToast('Ödeme vadesi oluşturulamadı')
    },
  })
}

export const useUpdatePaymentTerm = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PaymentTermPayload }) =>
      definitionsApi.paymentTerms.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'paymentTerms'] })
      pushToast('Ödeme vadesi güncellendi', 'success')
    },
    onError: () => {
      pushToast('Ödeme vadesi güncellenirken hata oluştu')
    },
  })
}

export const useDeletePaymentTerm = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (id: string) => definitionsApi.paymentTerms.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'paymentTerms'] })
      pushToast('Ödeme vadesi silindi', 'success')
    },
    onError: () => {
      pushToast('Ödeme vadesi silinirken hata oluştu')
    },
  })
}

export const useTogglePaymentTermStatus = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (id: string) => definitionsApi.paymentTerms.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'paymentTerms'] })
      pushToast('Ödeme vadesi durumu değiştirildi', 'success')
    },
    onError: () => {
      pushToast('Ödeme vadesi durumu değiştirilirken hata oluştu')
    },
  })
}
