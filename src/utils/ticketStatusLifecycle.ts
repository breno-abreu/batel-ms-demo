import type { TicketStatus, TicketStatusLifecycleFlag } from '@/types/tickets'

export const TICKET_STATUS_LIFECYCLE_OPTIONS: Array<{
  value: TicketStatusLifecycleFlag
  label: string
  hint: string
}> = [
  {
    value: 'open',
    label: 'Aberto',
    hint: 'Ticket recém-criado ou reaberto; o solicitante ainda pode editar.'
  },
  {
    value: 'in_analysis',
    label: 'Em análise',
    hint: 'Equipe está avaliando ou trabalhando no ticket.'
  },
  {
    value: 'resolved',
    label: 'Resolvido',
    hint: 'Problema tratado e ticket encerrado com sucesso.'
  },
  {
    value: 'cancelled',
    label: 'Cancelado',
    hint: 'Ticket inválido, duplicado ou desistência.'
  }
]

export function getTicketStatusLifecycleFlag(
  status: {
    isOpen?: boolean
    isOpenStatus?: boolean
    isInAnalysis?: boolean
    isInAnalysisStatus?: boolean
    isResolved?: boolean
    isResolvedStatus?: boolean
    isCancelled?: boolean
    isCancelledStatus?: boolean
  }
): TicketStatusLifecycleFlag {
  if (status.isOpen || status.isOpenStatus) {
    return 'open'
  }

  if (status.isResolved || status.isResolvedStatus) {
    return 'resolved'
  }

  if (status.isCancelled || status.isCancelledStatus) {
    return 'cancelled'
  }

  return 'in_analysis'
}

export function getTicketStatusLifecycleLabel(
  flag: TicketStatusLifecycleFlag | string | null | undefined
): string {
  const option = TICKET_STATUS_LIFECYCLE_OPTIONS.find((item) => item.value === flag)
  return option?.label ?? '—'
}

export function getTicketStatusLifecycleClass(
  flag: TicketStatusLifecycleFlag | string | null | undefined
): string {
  switch (flag) {
    case 'open':
      return 'repertoire-status--ticket-open'
    case 'in_analysis':
      return 'repertoire-status--ticket-in-analysis'
    case 'resolved':
      return 'repertoire-status--ticket-resolved'
    case 'cancelled':
      return 'repertoire-status--ticket-cancelled'
    default:
      return 'repertoire-status--pending'
  }
}

export function buildTicketStatusLifecyclePayload(
  flag: TicketStatusLifecycleFlag
): Pick<TicketStatus, 'isOpen' | 'isInAnalysis' | 'isResolved' | 'isCancelled'> {
  return {
    isOpen: flag === 'open',
    isInAnalysis: flag === 'in_analysis',
    isResolved: flag === 'resolved',
    isCancelled: flag === 'cancelled'
  }
}
