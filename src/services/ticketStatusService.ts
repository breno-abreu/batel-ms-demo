import { demoTicketStatusApi } from '@/demo/api/catalogDemoApi'
import { withDemoMutation } from '@/demo/demoRequest'
import type { CreateTicketStatusRequest, ReorderTicketStatusesRequest, UpdateTicketStatusRequest } from '@/types/tickets'

export const ticketStatusService = {
  list() {
    return demoTicketStatusApi.list()
  },
  create(_payload: CreateTicketStatusRequest) {
    return withDemoMutation(() => demoTicketStatusApi.create())
  },

  update(id: number, _payload: UpdateTicketStatusRequest) {
    return withDemoMutation(() => demoTicketStatusApi.update(id))
  },

  reorder(_payload: ReorderTicketStatusesRequest) {
    return withDemoMutation(() => demoTicketStatusApi.reorder())
  },

  remove(_id: number) {
    return withDemoMutation(() => demoTicketStatusApi.remove())
  }
}
