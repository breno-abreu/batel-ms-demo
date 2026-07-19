import { demoTicketStatusApi } from '@/demo/api/catalogDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type {
  CreateTicketStatusRequest,
  ReorderTicketStatusesRequest,
  TicketStatusListResponse,
  TicketStatusResponse,
  UpdateTicketStatusRequest
} from '@/types/tickets'

export const ticketStatusService = {
  list() {
    if (IS_DEMO_MODE) {
      return demoTicketStatusApi.list()
    }

    return httpClient.get<TicketStatusListResponse>('/api/ticket-statuses')
  },

  create(payload: CreateTicketStatusRequest) {
    if (IS_DEMO_MODE) {
      return demoTicketStatusApi.create()
    }

    return httpClient.post<TicketStatusResponse>(
      '/api/ticket-statuses',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdateTicketStatusRequest) {
    if (IS_DEMO_MODE) {
      return demoTicketStatusApi.update(id)
    }

    return httpClient.put<TicketStatusResponse>(
      `/api/ticket-statuses/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  reorder(payload: ReorderTicketStatusesRequest) {
    if (IS_DEMO_MODE) {
      return demoTicketStatusApi.reorder()
    }

    return httpClient.put<TicketStatusListResponse>(
      '/api/ticket-statuses/reorder',
      payload,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoTicketStatusApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/ticket-statuses/${id}`,
      { skipErrorRedirect: true }
    )
  }
}
