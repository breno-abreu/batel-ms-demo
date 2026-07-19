import { defineStore } from 'pinia'
import type { ShowToastOptions, ToastItem } from '@/types/toast'

const DEFAULT_TOAST_DURATION_MS = 5000

export const useToastStore = defineStore('toast', {
  state: () => ({
    items: [] as ToastItem[]
  }),
  actions: {
    show(options: ShowToastOptions): string {
      const id = crypto.randomUUID()
      const duration = options.duration ?? DEFAULT_TOAST_DURATION_MS

      this.items.push({
        id,
        type: options.type,
        message: options.message
      })

      if (duration > 0) {
        window.setTimeout(() => {
          this.dismiss(id)
        }, duration)
      }

      return id
    },
    dismiss(id: string): void {
      this.items = this.items.filter((item) => item.id !== id)
    },
    clear(): void {
      this.items = []
    }
  }
})
