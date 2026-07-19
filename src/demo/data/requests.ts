import {
  demoPriorities,
  demoPurchaseRequestStatuses,
  demoWorkTaskStatuses
} from '@/demo/data/catalogs'
import { demoMinistries, demoPeopleDetails } from '@/demo/data/people'
import type { PurchaseRequestListItem, WorkTaskListItem } from '@/types/requests'

const purchaseTitles = [
  'Cabos XLR', 'Microfone condensador', 'Pedestal', 'Fone de retorno',
  'Interface de áudio', 'Monitor de referência', 'Palheta grossa', 'Cordas de violão',
  'Bateria eletrônica', 'Projetor reserva', 'Cabo HDMI longo', 'SSD para notebook',
  'Webcam Full HD', 'Iluminação LED', 'Suporte de partitura', 'Afinador clip',
  'Capa de teclado', 'Mesa auxiliar', 'Extensão elétrica', 'Fita isolante',
  'Organizador de cabos', 'Lousa portátil', 'Papelaria equipe', 'Livros hinário',
  'Camisetas evento', 'Bandeiras decoração', 'Água para ensaio', 'Café reunão',
  'Kit limpeza Som', 'Pilhas AA', 'Cartões de visita', 'Banner retrátil',
  'Toner impressora', 'Mouse sem fio', 'Teclado USB', 'Hub USB-C'
]

export const demoPurchaseRequests: PurchaseRequestListItem[] = purchaseTitles.map((title, index) => {
  const ministry = demoMinistries[index % demoMinistries.length]
  const status = demoPurchaseRequestStatuses[index % demoPurchaseRequestStatuses.length]
  const priority = demoPriorities[index % demoPriorities.length]
  const person = demoPeopleDetails[index % demoPeopleDetails.length]

  return {
    id: index + 1,
    title,
    description: `Solicitação demonstrativa para adquirir ${title.toLowerCase()}.`,
    ministryId: ministry.id,
    ministryName: ministry.name,
    purchaseRequestStatusId: status.id,
    purchaseRequestStatusName: status.name,
    isPendingStatus: status.isPending,
    isInAnalysisStatus: status.isInAnalysis,
    isApprovedStatus: status.isApproved,
    isPurchasedStatus: status.isPurchased,
    isRejectedStatus: status.isRejected,
    priorityId: priority.id,
    priorityName: priority.name,
    requestedByPersonId: person.id,
    requestedByPersonName: person.fullName,
    estimatedValue: 50 + index * 17.5,
    neededByDate: `2026-${String((index % 12) + 1).padStart(2, '0')}-15`,
    createdAt: `2026-02-${String((index % 27) + 1).padStart(2, '0')}T11:00:00.000Z`,
    createdByUserId: 1
  }
})

const taskTitles = [
  'Atualizar repertório do mês', 'Revisar escalas', 'Organizar ensaio especial',
  'Publicar cronograma', 'Conferir equipamentos', 'Treinar nova equipe',
  'Atualizar links úteis', 'Preparar material infantil', 'Reunião com líderes',
  'Inventariar instrumentos', 'Configurar projeção', 'Testar transmissão',
  'Arquivar partituras', 'Limpar cabos', 'Montar checklist',
  'Atualizar contatos', 'Planejar batalha musical', 'Criar pasta Natal',
  'Homologar permissões', 'Revisar aniversariantes', 'Exportar relatório',
  'Ajustar templates', 'Validar hashes públicos', 'Documentar processos',
  'Treinar recepção', 'Separar kits vocais', 'Atualizar status tickets',
  'Preparar batismo', 'Organizar camarins', 'Checar backup',
  'Agendar manutenção', 'Solicitar orçamento', 'Publicar aviso',
  'Atualizar fotos', 'Revisar agenda', 'Confirmar músicos'
]

export const demoWorkTasks: WorkTaskListItem[] = taskTitles.map((title, index) => {
  const ministry = demoMinistries[index % demoMinistries.length]
  const status = demoWorkTaskStatuses[index % demoWorkTaskStatuses.length]
  const priority = demoPriorities[index % demoPriorities.length]
  const assignee = demoPeopleDetails[(index + 2) % demoPeopleDetails.length]
  const completed = status.isCompleted

  return {
    id: index + 1,
    title,
    description: `Tarefa demonstrativa: ${title}.`,
    ministryId: ministry.id,
    ministryName: ministry.name,
    taskStatusId: status.id,
    taskStatusName: status.name,
    isPendingStatus: status.isPending,
    isInProgressStatus: status.isInProgress,
    isCompletedStatus: status.isCompleted,
    isCancelledStatus: status.isCancelled,
    taskPriorityId: priority.id,
    taskPriorityName: priority.name,
    assignedToPersonId: index % 6 === 0 ? null : assignee.id,
    assignedToPersonName: index % 6 === 0 ? null : assignee.fullName,
    dueDate: `2026-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`,
    completedAt: completed ? '2026-06-01T16:00:00.000Z' : null,
    createdAt: `2026-03-${String((index % 27) + 1).padStart(2, '0')}T09:30:00.000Z`,
    createdByUserId: 1
  }
})
