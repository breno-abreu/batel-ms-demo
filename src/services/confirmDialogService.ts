import { useConfirmDialogStore } from '@/stores/confirmDialogStore'
import type { ConfirmDialogChoice, ConfirmDialogOptions } from '@/types/confirmDialog'

export const confirmDialogService = {
  confirm(options: ConfirmDialogOptions): Promise<boolean> {
    return useConfirmDialogStore().open(options)
  },
  choose(options: ConfirmDialogOptions): Promise<ConfirmDialogChoice> {
    return useConfirmDialogStore().openChoice(options)
  }
}
