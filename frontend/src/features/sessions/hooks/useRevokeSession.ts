import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToastStore } from '@/store/toastStore'
import { sessionsApi } from '../api/sessionsApi'

export const useRevokeSession = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: (sessionId: string) => sessionsApi.revoke(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      pushToast('Oturum sonlandırıldı', 'success')
    },
    onError: () => {
      pushToast('Oturum sonlandırılırken hata oluştu')
    },
  })
}
