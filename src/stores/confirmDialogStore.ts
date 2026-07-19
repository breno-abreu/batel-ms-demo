import { defineStore } from 'pinia'
import type {
  ConfirmDialogChoice,
  ConfirmDialogOptions,
  ConfirmDialogState
} from '@/types/confirmDialog'

type ConfirmDialogStoreState = {
  current: ConfirmDialogState | null
  resolver: ((choice: ConfirmDialogChoice) => void) | null
}

export const useConfirmDialogStore = defineStore('confirmDialog', {
  state: (): ConfirmDialogStoreState => ({
    current: null,
    resolver: null
  }),
  actions: {
    open(options: ConfirmDialogOptions): Promise<boolean> {
      return this.openChoice(options).then((choice) => choice === 'confirm')
    },
    openChoice(options: ConfirmDialogOptions): Promise<ConfirmDialogChoice> {
      if (this.resolver) {
        this.resolver('dismiss')
      }

      this.current = {
        id: crypto.randomUUID(),
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'Confirmar',
        secondaryLabel: options.secondaryLabel ?? options.cancelLabel ?? 'Cancelar',
        tone: options.tone ?? 'warning'
      }

      return new Promise<ConfirmDialogChoice>((resolve) => {
        this.resolver = resolve
      })
    },
    confirm(): void {
      this.resolve('confirm')
    },
    secondary(): void {
      this.resolve('secondary')
    },
    dismiss(): void {
      this.resolve('dismiss')
    },
    cancel(): void {
      this.dismiss()
    },
    resolve(choice: ConfirmDialogChoice): void {
      const resolver = this.resolver

      this.current = null
      this.resolver = null

      resolver?.(choice)
    }
  }
})
