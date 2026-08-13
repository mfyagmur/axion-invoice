import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToastStore } from '@/store/toastStore'
import { sessionsApi } from '../api/sessionsApi'

export const useRevokeOtherSessions = () => {
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn: () => sessionsApi.revokeOthers(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      pushToast(`${data.revoked_count} oturum sonlandırıldı`, 'success')
    },
    onError: () => {
      pushToast('Oturumlar sonlandırılırken hata oluştu')
    },
  })
}
