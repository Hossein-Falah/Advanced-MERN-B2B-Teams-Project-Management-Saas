// در فایل جداگانه یا بالای فایل interceptor
export class CustomError extends Error {
  public code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'CustomError'
    this.code = code
  }
}
