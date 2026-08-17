import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToastStore } from '@/store/toastStore'
import { definitionsApi } from '../api/definitionsApi'
import type { BankAccountPayload } from '@/types/definitions'

export const useBankAccounts = () => {
  return useQuery({
    queryKey: ['definitions', 'bankAccounts'],
    queryFn: () => definitionsApi.bankAccounts.list(),
  })
}

export const useCreateBankAccount = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (payload: BankAccountPayload) => definitionsApi.bankAccounts.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'bankAccounts'] })
      pushToast('Banka hesabı oluşturuldu', 'success')
    },
    onError: () => {
      pushToast('Banka hesabı oluşturulamadı')
    },
  })
}

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BankAccountPayload }) =>
      definitionsApi.bankAccounts.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'bankAccounts'] })
      pushToast('Banka hesabı güncellendi', 'success')
    },
    onError: () => {
      pushToast('Banka hesabı güncellenirken hata oluştu')
    },
  })
}

export const useDeleteBankAccount = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (id: string) => definitionsApi.bankAccounts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'bankAccounts'] })
      pushToast('Banka hesabı silindi', 'success')
    },
    onError: () => {
      pushToast('Banka hesabı silinirken hata oluştu')
    },
  })
}

export const useToggleBankAccountStatus = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (id: string) => definitionsApi.bankAccounts.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'bankAccounts'] })
      pushToast('Banka hesabı durumu değiştirildi', 'success')
    },
    onError: () => {
      pushToast('Banka hesabı durumu değiştirilirken hata oluştu')
    },
  })
}
