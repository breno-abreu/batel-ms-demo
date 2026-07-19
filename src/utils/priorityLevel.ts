import type { Priority, PriorityLevelFlag } from '@/types/tickets'

export const PRIORITY_LEVEL_OPTIONS: Array<{
  value: PriorityLevelFlag
  label: string
  hint: string
}> = [
  {
    value: 'low',
    label: 'Baixa',
    hint: 'Demanda sem urgência; pode aguardar na fila.'
  },
  {
    value: 'normal',
    label: 'Normal',
    hint: 'Prioridade padrão do dia a dia.'
  },
  {
    value: 'high',
    label: 'Alta',
    hint: 'Requer atenção preferencial em breve.'
  },
  {
    value: 'urgent',
    label: 'Urgente',
    hint: 'Tratamento imediato ou crítico.'
  }
]

export function getPriorityLevelFlag(
  priority: {
    isLow?: boolean
    isNormal?: boolean
    isHigh?: boolean
    isUrgent?: boolean
  }
): PriorityLevelFlag {
  if (priority.isUrgent) {
    return 'urgent'
  }

  if (priority.isHigh) {
    return 'high'
  }

  if (priority.isLow) {
    return 'low'
  }

  return 'normal'
}

export function getPriorityLevelLabel(
  flag: PriorityLevelFlag | string | null | undefined
): string {
  const option = PRIORITY_LEVEL_OPTIONS.find((item) => item.value === flag)
  return option?.label ?? '—'
}

export function getPriorityLevelClass(
  flag: PriorityLevelFlag | string | null | undefined
): string {
  switch (flag) {
    case 'low':
      return 'repertoire-status--priority-low'
    case 'normal':
      return 'repertoire-status--priority-normal'
    case 'high':
      return 'repertoire-status--priority-high'
    case 'urgent':
      return 'repertoire-status--priority-urgent'
    default:
      return 'repertoire-status--pending'
  }
}

export function buildPriorityLevelPayload(
  flag: PriorityLevelFlag
): Pick<Priority, 'isLow' | 'isNormal' | 'isHigh' | 'isUrgent'> {
  return {
    isLow: flag === 'low',
    isNormal: flag === 'normal',
    isHigh: flag === 'high',
    isUrgent: flag === 'urgent'
  }
}
