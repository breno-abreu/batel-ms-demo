import {
  demoPriorities,
  demoTicketStatuses,
  demoTicketTypes
} from '@/demo/data/catalogs'
import { demoPeopleDetails } from '@/demo/data/people'
import type { TicketAdminListItem, TicketListItem } from '@/types/tickets'

/** Quantidade suficiente para mais de 5 páginas (20 itens/página) na listagem admin. */
const DEMO_TICKET_COUNT = 110

const titleTemplates = [
  'Não consigo abrir a escala', 'Erro ao salvar música', 'Sugestão de filtro',
  'Problema no login', 'Dúvida sobre permissões', 'Falha ao compartilhar pasta',
  'Página em branco na agenda', 'Solicitar acesso ao cadastro', 'Bug no favoritar',
  'Ajuste no relatório', 'Lentidão na listagem', 'Erro 404 ao editar',
  'Melhoria no modal', 'Problema com data', 'Exportação PNG falhou',
  'Notificação de aniversário', 'Sidebar cortada no mobile', 'Toast duplicado',
  'Ordem de status', 'Campo obrigatório', 'Upload externo inválido',
  'Link público expirado', 'Filtro de mês', 'Contagem inconsistente',
  'Sugestão de UX', 'Texto truncado', 'Skeleton infinito', 'Botão desabilitado',
  'Permissão indevida', 'Falha intermitente', 'Zoom da interface',
  'Nome do ministério', 'Validação de telefone', 'Corte no calendário',
  'Ícone ausente', 'Mensagem genérica'
]

function buildTicketTitle(index: number): string {
  const base = titleTemplates[index % titleTemplates.length]
  const cycle = Math.floor(index / titleTemplates.length)

  if (cycle === 0) {
    return base
  }

  return `${base} (${cycle + 1})`
}

export const demoTicketsMine: TicketListItem[] = Array.from(
  { length: DEMO_TICKET_COUNT },
  (_, index) => {
    const title = buildTicketTitle(index)
    const type = demoTicketTypes[index % demoTicketTypes.length]
    const status = demoTicketStatuses[index % demoTicketStatuses.length]
    const priority = demoPriorities[index % demoPriorities.length]

    return {
      id: index + 1,
      title,
      description: `Descrição demonstrativa do chamado: ${title}.`,
      ticketTypeId: type.id,
      ticketTypeName: type.name,
      ticketStatusId: status.id,
      ticketStatusName: status.name,
      isOpenStatus: status.isOpen,
      isInAnalysisStatus: status.isInAnalysis,
      isResolvedStatus: status.isResolved,
      isCancelledStatus: status.isCancelled,
      ticketPriorityId: priority.id,
      ticketPriorityName: priority.name,
      createdAt: `2026-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}T10:00:00.000Z`
    }
  }
)

export const demoTicketsAdmin: TicketAdminListItem[] = demoTicketsMine.map((ticket, index) => {
  const person = demoPeopleDetails[index % Math.min(8, demoPeopleDetails.length)]

  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    createdByUserId: person.id,
    createdByName: person.fullName,
    ticketTypeId: ticket.ticketTypeId,
    ticketTypeName: ticket.ticketTypeName,
    ticketStatusId: ticket.ticketStatusId,
    ticketStatusName: ticket.ticketStatusName,
    isOpenStatus: ticket.isOpenStatus,
    isInAnalysisStatus: ticket.isInAnalysisStatus,
    isResolvedStatus: ticket.isResolvedStatus,
    isCancelledStatus: ticket.isCancelledStatus,
    ticketPriorityId: ticket.ticketPriorityId,
    ticketPriorityName: ticket.ticketPriorityName,
    createdAt: ticket.createdAt
  }
})
