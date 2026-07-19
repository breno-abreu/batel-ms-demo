export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type ToastItem = {
  id: string
  type: ToastType
  message: string
}

export type ShowToastOptions = {
  type: ToastType
  message: string
  duration?: number
}
