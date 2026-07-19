import { useToastStore } from '@/stores/toastStore'
import type { ToastType } from '@/types/toast'

function show(type: ToastType, message: string, duration?: number): string {
  return useToastStore().show({ type, message, duration })
}

export const toastService = {
  success(message: string, duration?: number): string {
    return show('success', message, duration)
  },
  error(message: string, duration?: number): string {
    return show('error', message, duration)
  },
  info(message: string, duration?: number): string {
    return show('info', message, duration)
  },
  warning(message: string, duration?: number): string {
    return show('warning', message, duration)
  },
  dismiss(id: string): void {
    useToastStore().dismiss(id)
  },
  clear(): void {
    useToastStore().clear()
  }
}
