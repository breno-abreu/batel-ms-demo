import type {
  WorkTaskStatus,
  WorkTaskStatusLifecycleFlag
} from '@/types/requests'

export const WORK_TASK_STATUS_LIFECYCLE_OPTIONS: Array<{
  value: WorkTaskStatusLifecycleFlag
  label: string
  hint: string
}> = [
  {
    value: 'pending',
    label: 'Pendente',
    hint: 'Tarefa criada e ainda não iniciada.'
  },
  {
    value: 'in_progress',
    label: 'Em andamento',
    hint: 'Tarefa em execução no momento.'
  },
  {
    value: 'completed',
    label: 'Concluída',
    hint: 'Tarefa finalizada com sucesso.'
  },
  {
    value: 'cancelled',
    label: 'Cancelada',
    hint: 'Tarefa invalidada ou descontinuada.'
  }
]

export function getWorkTaskStatusLifecycleFlag(
  status: {
    isPending?: boolean
    isPendingStatus?: boolean
    isInProgress?: boolean
    isInProgressStatus?: boolean
    isCompleted?: boolean
    isCompletedStatus?: boolean
    isCancelled?: boolean
    isCancelledStatus?: boolean
  }
): WorkTaskStatusLifecycleFlag {
  if (status.isPending || status.isPendingStatus) {
    return 'pending'
  }

  if (status.isCompleted || status.isCompletedStatus) {
    return 'completed'
  }

  if (status.isCancelled || status.isCancelledStatus) {
    return 'cancelled'
  }

  return 'in_progress'
}

export function getWorkTaskStatusLifecycleLabel(
  flag: WorkTaskStatusLifecycleFlag | string | null | undefined
): string {
  const option = WORK_TASK_STATUS_LIFECYCLE_OPTIONS.find((item) => item.value === flag)
  return option?.label ?? '—'
}

export function getWorkTaskStatusLifecycleClass(
  flag: WorkTaskStatusLifecycleFlag | string | null | undefined
): string {
  switch (flag) {
    case 'pending':
      return 'repertoire-status--task-pending'
    case 'in_progress':
      return 'repertoire-status--task-in-progress'
    case 'completed':
      return 'repertoire-status--task-completed'
    case 'cancelled':
      return 'repertoire-status--task-cancelled'
    default:
      return 'repertoire-status--pending'
  }
}

export function buildWorkTaskStatusLifecyclePayload(
  flag: WorkTaskStatusLifecycleFlag
): Pick<WorkTaskStatus, 'isPending' | 'isInProgress' | 'isCompleted' | 'isCancelled'> {
  return {
    isPending: flag === 'pending',
    isInProgress: flag === 'in_progress',
    isCompleted: flag === 'completed',
    isCancelled: flag === 'cancelled'
  }
}
