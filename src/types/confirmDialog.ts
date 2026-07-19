export type ConfirmDialogTone = 'danger' | 'warning' | 'info'
export type ConfirmDialogChoice = 'confirm' | 'secondary' | 'dismiss'

export type ConfirmDialogOptions = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  secondaryLabel?: string
  tone?: ConfirmDialogTone
}

export type ConfirmDialogState = {
  id: string
  title: string
  message: string
  confirmLabel: string
  secondaryLabel: string
  tone: ConfirmDialogTone
}
