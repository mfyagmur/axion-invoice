import { useQuery } from '@tanstack/react-query'
import { sessionsApi } from '../api/sessionsApi'

export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => sessionsApi.list(),
  })
}
