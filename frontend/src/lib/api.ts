import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000',
})

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete api.defaults.headers.common.Authorization
}

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (
      (typeof error.response?.data?.error === 'string' && error.response.data.error) ||
      error.message ||
      'Something went wrong'
    )
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong'
}

export { api }
