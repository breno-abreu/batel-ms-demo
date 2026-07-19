import { confirmDialogService } from '@/services/confirmDialogService'
import type { ConfirmDialogChoice } from '@/types/confirmDialog'

export function promptUnsavedChanges(): Promise<ConfirmDialogChoice> {
  return confirmDialogService.choose({
    title: 'Alterações não salvas',
    message: 'Existem alterações não salvas. O que deseja fazer?',
    confirmLabel: 'Salvar',
    secondaryLabel: 'Sair sem salvar',
    tone: 'warning'
  })
}
