import axios, { AxiosError } from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL

const API = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
})

API.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (!error.response) {
      error.message = 'NETWORK_ERROR'
      return Promise.reject(error)
    }

    const { status, data } = error.response

    switch (status) {
      case 401:
        error.message = data?.code || 'UNAUTHORIZED'
        break

      case 403:
        error.message = data?.code || 'FORBIDDEN'
        break

      case 400:
      case 422:
        error.message = data?.code || 'VALIDATION_ERROR'
        break

      case 404:
        error.message = data?.code || 'NOT_FOUND'
        break

      case 500:
      case 502:
      case 503:
      case 504:
        error.message = data?.code || 'SERVER_ERROR'
        break

      default:
        error.message = data?.code || 'UNKNOWN_ERROR'
    }

    return Promise.reject(error)
  }
)

export default API
