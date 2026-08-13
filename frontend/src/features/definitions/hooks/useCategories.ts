import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToastStore } from '@/store/toastStore'
import { definitionsApi } from '../api/definitionsApi'
import type { CategoryPayload } from '@/types/definitions'

export const useCategories = () => {
  return useQuery({
    queryKey: ['definitions', 'categories'],
    queryFn: () => definitionsApi.categories.list(),
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (payload: CategoryPayload) => definitionsApi.categories.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'categories'] })
      pushToast('Kategori oluşturuldu', 'success')
    },
    onError: () => {
      pushToast('Kategori oluşturulamadı')
    },
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CategoryPayload }) =>
      definitionsApi.categories.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'categories'] })
      pushToast('Kategori güncellendi', 'success')
    },
    onError: () => {
      pushToast('Kategori güncellenirken hata oluştu')
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (id: string) => definitionsApi.categories.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'categories'] })
      pushToast('Kategori silindi', 'success')
    },
    onError: () => {
      pushToast('Kategori silinirken hata oluştu')
    },
  })
}

export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (id: string) => definitionsApi.categories.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'categories'] })
      pushToast('Kategori durumu değiştirildi', 'success')
    },
    onError: () => {
      pushToast('Kategori durumu değiştirilirken hata oluştu')
    },
  })
}
