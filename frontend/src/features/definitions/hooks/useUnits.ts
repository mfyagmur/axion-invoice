import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToastStore } from '@/store/toastStore'
import { definitionsApi } from '../api/definitionsApi'
import type { UnitPayload } from '@/types/definitions'

export const useUnits = () => {
  return useQuery({
    queryKey: ['definitions', 'units'],
    queryFn: () => definitionsApi.units.list(),
  })
}

export const useCreateUnit = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (payload: UnitPayload) => definitionsApi.units.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'units'] })
      pushToast('Birim oluşturuldu', 'success')
    },
    onError: () => {
      pushToast('Birim oluşturulamadı')
    },
  })
}

export const useUpdateUnit = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UnitPayload }) =>
      definitionsApi.units.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'units'] })
      pushToast('Birim güncellendi', 'success')
    },
    onError: () => {
      pushToast('Birim güncellenirken hata oluştu')
    },
  })
}

export const useDeleteUnit = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (id: string) => definitionsApi.units.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'units'] })
      pushToast('Birim silindi', 'success')
    },
    onError: () => {
      pushToast('Birim silinirken hata oluştu')
    },
  })
}

export const useToggleUnitStatus = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (id: string) => definitionsApi.units.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'units'] })
      pushToast('Birim durumu değiştirildi', 'success')
    },
    onError: () => {
      pushToast('Birim durumu değiştirilirken hata oluştu')
    },
  })
}
