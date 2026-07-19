import { demoTicketsAdmin, demoTicketsMine } from '@/demo/data/tickets'
import { demoMutationOk, demoNotFound, demoOk, matchesSearch, paginateItems } from '@/demo/demoHelpers'
import type { TicketListQuery } from '@/types/tickets'

function filterTickets<T extends {
  title: string
  description: string
  ticketTypeId: number
  ticketStatusId: number
  ticketPriorityId: number
}>(items: T[], query: TicketListQuery = {}) {
  let filtered = [...items]

  if (query.search?.trim()) {
    filtered = filtered.filter((item) =>
      matchesSearch(item.title, query.search)
      || matchesSearch(item.description, query.search)
    )
  }

  if (query.ticketTypeId) {
    filtered = filtered.filter((item) => item.ticketTypeId === query.ticketTypeId)
  }

  if (query.ticketStatusId) {
    filtered = filtered.filter((item) => item.ticketStatusId === query.ticketStatusId)
  }

  if (query.ticketPriorityId) {
    filtered = filtered.filter((item) => item.ticketPriorityId === query.ticketPriorityId)
  }

  return filtered
}

export const demoTicketApi = {
  listMine: async (query: TicketListQuery = {}) =>
    demoOk(paginateItems(filterTickets(demoTicketsMine, query), query.page ?? 1, query.pageSize ?? 20)),
  create: async () => demoMutationOk(demoTicketsMine[0]),
  update: async (id: number) => {
    const ticket = demoTicketsMine.find((item) => item.id === id) ?? demoTicketsMine[0]
    return demoMutationOk(ticket)
  },
  remove: async () => demoMutationOk(null),
  listForAdmin: async (query: TicketListQuery = {}) =>
    demoOk(paginateItems(filterTickets(demoTicketsAdmin, query), query.page ?? 1, query.pageSize ?? 20)),
  getForAdmin: async (id: number) => {
    const ticket = demoTicketsAdmin.find((item) => item.id === id)
    return ticket ? demoOk(ticket) : demoNotFound()
  },
  updateByAdmin: async (id: number) => {
    const ticket = demoTicketsAdmin.find((item) => item.id === id) ?? demoTicketsAdmin[0]
    return demoMutationOk(ticket)
  }
}
