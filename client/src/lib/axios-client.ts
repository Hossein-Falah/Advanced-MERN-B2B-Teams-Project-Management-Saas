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
      error.message =
        'اتصال به سرور برقرار نشد. لطفاً اینترنت خود را بررسی کنید'
      error.code = 'NETWORK_ERROR'
      return Promise.reject(error)
    }

    const { status, data } = error.response

    switch (status) {
      case 401:
        error.message = 'لطفا مجدد وارد شوید'
        error.code = data?.errorCode || 'UNAUTHORIZED'
        break

      case 403:
        error.message = data?.message || 'دسترسی ندارید'
        error.code = data?.errorCode || 'FORBIDDEN'
        break

      case 400:
      case 422:
        error.message = data?.message || 'مقادیر ارسال شده نامعتبر است'
        error.code = data?.errorCode || 'VALIDATION_ERROR'
        break

      case 404:
        error.message = data?.message || 'منبع مورد نظر پیدا نشد'
        error.code = data?.errorCode || 'NOT_FOUND'
        break

      case 500:
      case 502:
      case 503:
      case 504:
        error.message = 'خطا در اتصال به سرور'
        error.code = data?.errorCode || 'SERVER_ERROR'
        break

      default:
        error.message = data?.message || 'خطای ناشناخته رخ داده است'
        error.code = data?.errorCode || 'UNKNOWN_ERROR'
    }

    return Promise.reject(error)
  },
)

export default API
