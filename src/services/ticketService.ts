import { demoTicketApi } from '@/demo/api/ticketDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { AdminUpdateTicketRequest, CreateTicketRequest, TicketListQuery, UpdateTicketRequest } from '@/types/tickets'

export const ticketService = {
  listMine(query: TicketListQuery = {}) {
    return demoTicketApi.listMine(query)
  },

  create(_payload: CreateTicketRequest) {
    return withDemoMutation(() => demoTicketApi.create())
  },

  update(id: number, _payload: UpdateTicketRequest) {
    return withDemoMutation(() => demoTicketApi.update(id))
  },

  remove(_id: number) {
    return withDemoMutation(() => demoTicketApi.remove())
  },

  listForAdmin(query: TicketListQuery = {}) {
    return demoTicketApi.listForAdmin(query)
  },

  getForAdmin(id: number) {
    return demoTicketApi.getForAdmin(id)
  },

  updateByAdmin(id: number, _payload: AdminUpdateTicketRequest) {
    return withDemoMutation(() => demoTicketApi.updateByAdmin(id))
  }
}
