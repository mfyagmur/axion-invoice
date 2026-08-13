export interface UserSession {
  id: string
  user_agent: string | null
  ip_address: string | null
  created_at: string
  last_used_at: string
  is_current: boolean
}
