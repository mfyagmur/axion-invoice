import axios from 'axios'

export function getSignupErrorKey(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 409) {
    return 'auth.signup.errors.emailTaken'
  }
  return 'common.genericError'
}

export function getLoginErrorKey(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    return 'auth.login.error'
  }
  return 'common.genericError'
}
