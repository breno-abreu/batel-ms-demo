import type {
  PurchaseRequestStatus,
  PurchaseRequestStatusLifecycleFlag
} from '@/types/requests'

export const PURCHASE_REQUEST_STATUS_LIFECYCLE_OPTIONS: Array<{
  value: PurchaseRequestStatusLifecycleFlag
  label: string
  hint: string
}> = [
  {
    value: 'pending',
    label: 'Pendente',
    hint: 'Solicitação recém-criada; ainda não foi analisada.'
  },
  {
    value: 'in_analysis',
    label: 'Em análise',
    hint: 'Liderança ou tesouraria está avaliando a solicitação.'
  },
  {
    value: 'approved',
    label: 'Aprovada',
    hint: 'Solicitação autorizada; pode seguir para compra.'
  },
  {
    value: 'purchased',
    label: 'Comprada',
    hint: 'Compra realizada; fluxo concluído com sucesso.'
  },
  {
    value: 'rejected',
    label: 'Recusada',
    hint: 'Solicitação não aprovada ou inválida.'
  }
]

export function getPurchaseRequestStatusLifecycleFlag(
  status: {
    isPending?: boolean
    isPendingStatus?: boolean
    isInAnalysis?: boolean
    isInAnalysisStatus?: boolean
    isApproved?: boolean
    isApprovedStatus?: boolean
    isPurchased?: boolean
    isPurchasedStatus?: boolean
    isRejected?: boolean
    isRejectedStatus?: boolean
  }
): PurchaseRequestStatusLifecycleFlag {
  if (status.isPending || status.isPendingStatus) {
    return 'pending'
  }

  if (status.isApproved || status.isApprovedStatus) {
    return 'approved'
  }

  if (status.isPurchased || status.isPurchasedStatus) {
    return 'purchased'
  }

  if (status.isRejected || status.isRejectedStatus) {
    return 'rejected'
  }

  return 'in_analysis'
}

export function getPurchaseRequestStatusLifecycleLabel(
  flag: PurchaseRequestStatusLifecycleFlag | string | null | undefined
): string {
  const option = PURCHASE_REQUEST_STATUS_LIFECYCLE_OPTIONS.find((item) => item.value === flag)
  return option?.label ?? '—'
}

export function getPurchaseRequestStatusLifecycleClass(
  flag: PurchaseRequestStatusLifecycleFlag | string | null | undefined
): string {
  switch (flag) {
    case 'pending':
      return 'repertoire-status--purchase-pending'
    case 'in_analysis':
      return 'repertoire-status--purchase-in-analysis'
    case 'approved':
      return 'repertoire-status--purchase-approved'
    case 'purchased':
      return 'repertoire-status--purchase-purchased'
    case 'rejected':
      return 'repertoire-status--purchase-rejected'
    default:
      return 'repertoire-status--pending'
  }
}

export function buildPurchaseRequestStatusLifecyclePayload(
  flag: PurchaseRequestStatusLifecycleFlag
): Pick<
  PurchaseRequestStatus,
  'isPending' | 'isInAnalysis' | 'isApproved' | 'isPurchased' | 'isRejected'
> {
  return {
    isPending: flag === 'pending',
    isInAnalysis: flag === 'in_analysis',
    isApproved: flag === 'approved',
    isPurchased: flag === 'purchased',
    isRejected: flag === 'rejected'
  }
}
