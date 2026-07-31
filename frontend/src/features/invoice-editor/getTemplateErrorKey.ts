import axios from 'axios'

export function getTemplateErrorKey(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 402) {
    return 'templates.list.limitReached'
  }
  return 'common.genericError'
}
