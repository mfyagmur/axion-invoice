import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToastStore } from '@/store/toastStore'
import { definitionsApi } from '../api/definitionsApi'
import type { NotePayload } from '@/types/definitions'

export const useNotes = () => {
  return useQuery({
    queryKey: ['definitions', 'notes'],
    queryFn: () => definitionsApi.notes.list(),
  })
}

export const useCreateNote = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (payload: NotePayload) => definitionsApi.notes.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'notes'] })
      pushToast('Sabit açıklama oluşturuldu', 'success')
    },
    onError: () => {
      pushToast('Sabit açıklama oluşturulamadı')
    },
  })
}

export const useUpdateNote = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: NotePayload }) =>
      definitionsApi.notes.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'notes'] })
      pushToast('Sabit açıklama güncellendi', 'success')
    },
    onError: () => {
      pushToast('Sabit açıklama güncellenirken hata oluştu')
    },
  })
}

export const useDeleteNote = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (id: string) => definitionsApi.notes.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'notes'] })
      pushToast('Sabit açıklama silindi', 'success')
    },
    onError: () => {
      pushToast('Sabit açıklama silinirken hata oluştu')
    },
  })
}

export const useToggleNoteStatus = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (id: string) => definitionsApi.notes.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'notes'] })
      pushToast('Sabit açıklama durumu değiştirildi', 'success')
    },
    onError: () => {
      pushToast('Sabit açıklama durumu değiştirilirken hata oluştu')
    },
  })
}

export const useSetDefaultNote = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (id: string) => definitionsApi.notes.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions', 'notes'] })
      pushToast('Varsayılan sabit açıklama ayarlandı', 'success')
    },
    onError: () => {
      pushToast('Varsayılan sabit açıklama ayarlanırken hata oluştu')
    },
  })
}
