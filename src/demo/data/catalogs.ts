import { demoAudit } from '@/demo/demoHelpers'
import type {
  DifficultyLevel,
  MusicalTheme,
  PopularityLevel
} from '@/types/repertoire'
import type { EventType } from '@/types/events'
import type { Priority, TicketStatus, TicketType } from '@/types/tickets'
import type { PurchaseRequestStatus, WorkTaskStatus } from '@/types/requests'
import type { UsefulLinkType } from '@/types/usefulLinks'

function withCatalogAudit<T extends object>(item: T) {
  return { ...item, ...demoAudit }
}

export const demoDifficultyLevels: DifficultyLevel[] = [
  withCatalogAudit({
    id: 1,
    name: 'Iniciante',
    displayOrder: 1,
    linkedRepertoireCount: 12
  }),
  withCatalogAudit({
    id: 2,
    name: 'Intermediário',
    displayOrder: 2,
    linkedRepertoireCount: 18
  }),
  withCatalogAudit({
    id: 3,
    name: 'Avançado',
    displayOrder: 3,
    linkedRepertoireCount: 8
  })
]

export const demoPopularityLevels: PopularityLevel[] = [
  withCatalogAudit({
    id: 1,
    name: 'Pouco conhecida',
    displayOrder: 1,
    linkedRepertoireCount: 10
  }),
  withCatalogAudit({
    id: 2,
    name: 'Conhecida',
    displayOrder: 2,
    linkedRepertoireCount: 16
  }),
  withCatalogAudit({
    id: 3,
    name: 'Muito conhecida',
    displayOrder: 3,
    linkedRepertoireCount: 12
  })
]

export const demoMusicalThemes: MusicalTheme[] = [
  'Adoração',
  'Louvor',
  'Comunhão',
  'Missões',
  'Natal',
  'Esperança',
  'Gratidão',
  'Fé'
].map((name, index) =>
  withCatalogAudit({
    id: index + 1,
    name,
    description: `Temas relacionados a ${name.toLowerCase()}`,
    linkedRepertoireCount: 4 + index
  })
)

export const demoEventTypes: EventType[] = [
  'Culto',
  'Ensaio',
  'Reunião',
  'Especial',
  'Batismo'
].map((name, index) =>
  withCatalogAudit({
    id: index + 1,
    name,
    displayOrder: index + 1,
    linkedEventCount: 3 + index
  })
)

export const demoUsefulLinkTypes: UsefulLinkType[] = [
  'Documentos',
  'Ferramentas',
  'Vídeos',
  'Formulários',
  'Site'
].map((name, index) =>
  withCatalogAudit({
    id: index + 1,
    name,
    description: null,
    displayOrder: index + 1,
    linkedLinkCount: 6 + index
  })
)

export const demoTicketTypes: TicketType[] = [
  'Dúvida',
  'Problema',
  'Sugestão',
  'Acesso'
].map((name, index) =>
  withCatalogAudit({
    id: index + 1,
    name,
    displayOrder: index + 1,
    linkedTicketCount: 5 + index * 2
  })
)

export const demoTicketStatuses: TicketStatus[] = [
  { id: 1, name: 'Aberto', isOpen: true, isInAnalysis: false, isResolved: false, isCancelled: false },
  { id: 2, name: 'Em análise', isOpen: false, isInAnalysis: true, isResolved: false, isCancelled: false },
  { id: 3, name: 'Resolvido', isOpen: false, isInAnalysis: false, isResolved: true, isCancelled: false },
  { id: 4, name: 'Cancelado', isOpen: false, isInAnalysis: false, isResolved: false, isCancelled: true }
].map((item, index) =>
  withCatalogAudit({
    ...item,
    displayOrder: index + 1,
    linkedTicketCount: 4 + index
  })
)

export const demoPriorities: Priority[] = [
  { id: 1, name: 'Baixa', isLow: true, isNormal: false, isHigh: false, isUrgent: false },
  { id: 2, name: 'Normal', isLow: false, isNormal: true, isHigh: false, isUrgent: false },
  { id: 3, name: 'Alta', isLow: false, isNormal: false, isHigh: true, isUrgent: false },
  { id: 4, name: 'Urgente', isLow: false, isNormal: false, isHigh: false, isUrgent: true }
].map((item, index) =>
  withCatalogAudit({
    ...item,
    displayOrder: index + 1,
    linkedTicketCount: 6 + index
  })
)

export const demoWorkTaskStatuses: WorkTaskStatus[] = [
  {
    id: 1,
    name: 'Pendente',
    isPending: true,
    isInProgress: false,
    isCompleted: false,
    isCancelled: false
  },
  {
    id: 2,
    name: 'Em andamento',
    isPending: false,
    isInProgress: true,
    isCompleted: false,
    isCancelled: false
  },
  {
    id: 3,
    name: 'Concluída',
    isPending: false,
    isInProgress: false,
    isCompleted: true,
    isCancelled: false
  },
  {
    id: 4,
    name: 'Cancelada',
    isPending: false,
    isInProgress: false,
    isCompleted: false,
    isCancelled: true
  }
].map((item, index) =>
  withCatalogAudit({
    ...item,
    displayOrder: index + 1,
    linkedTaskCount: 5 + index * 3
  })
)

export const demoPurchaseRequestStatuses: PurchaseRequestStatus[] = [
  {
    id: 1,
    name: 'Pendente',
    isPending: true,
    isInAnalysis: false,
    isApproved: false,
    isPurchased: false,
    isRejected: false
  },
  {
    id: 2,
    name: 'Em análise',
    isPending: false,
    isInAnalysis: true,
    isApproved: false,
    isPurchased: false,
    isRejected: false
  },
  {
    id: 3,
    name: 'Aprovada',
    isPending: false,
    isInAnalysis: false,
    isApproved: true,
    isPurchased: false,
    isRejected: false
  },
  {
    id: 4,
    name: 'Comprada',
    isPending: false,
    isInAnalysis: false,
    isApproved: false,
    isPurchased: true,
    isRejected: false
  },
  {
    id: 5,
    name: 'Recusada',
    isPending: false,
    isInAnalysis: false,
    isApproved: false,
    isPurchased: false,
    isRejected: true
  }
].map((item, index) =>
  withCatalogAudit({
    ...item,
    displayOrder: index + 1,
    linkedPurchaseRequestCount: 4 + index * 2
  })
)
