import { demoTicketTypeApi } from '@/demo/api/catalogDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { CreateTicketTypeRequest, ReorderTicketTypesRequest, UpdateTicketTypeRequest } from '@/types/tickets'

export const ticketTypeService = {
  list() {
    return demoTicketTypeApi.list()
  },
  create(_payload: CreateTicketTypeRequest) {
    return withDemoMutation(() => demoTicketTypeApi.create())
  },

  update(id: number, _payload: UpdateTicketTypeRequest) {
    return withDemoMutation(() => demoTicketTypeApi.update(id))
  },

  reorder(_payload: ReorderTicketTypesRequest) {
    return withDemoMutation(() => demoTicketTypeApi.reorder())
  },

  remove(_id: number) {
    return withDemoMutation(() => demoTicketTypeApi.remove())
  }
}
