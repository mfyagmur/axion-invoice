import axios from 'axios'

export function getTemplateErrorKey(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 402) {
      return 'templates.list.limitReached'
    }
    if (error.response?.status === 403) {
      return 'demo.actionBlocked'
    }
  }
  return 'common.genericError'
}
