import { demoTicketTypeApi } from '@/demo/api/catalogDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type { ApiResponse } from '@/types/auth'
import type {
  CreateTicketTypeRequest,
  ReorderTicketTypesRequest,
  TicketTypeListResponse,
  TicketTypeResponse,
  UpdateTicketTypeRequest
} from '@/types/tickets'

export const ticketTypeService = {
  list() {
    if (IS_DEMO_MODE) {
      return demoTicketTypeApi.list()
    }

    return httpClient.get<TicketTypeListResponse>('/api/ticket-types')
  },

  create(payload: CreateTicketTypeRequest) {
    if (IS_DEMO_MODE) {
      return demoTicketTypeApi.create()
    }

    return httpClient.post<TicketTypeResponse>(
      '/api/ticket-types',
      payload,
      { skipErrorRedirect: true }
    )
  },

  update(id: number, payload: UpdateTicketTypeRequest) {
    if (IS_DEMO_MODE) {
      return demoTicketTypeApi.update(id)
    }

    return httpClient.put<TicketTypeResponse>(
      `/api/ticket-types/${id}`,
      payload,
      { skipErrorRedirect: true }
    )
  },

  reorder(payload: ReorderTicketTypesRequest) {
    if (IS_DEMO_MODE) {
      return demoTicketTypeApi.reorder()
    }

    return httpClient.put<TicketTypeListResponse>(
      '/api/ticket-types/reorder',
      payload,
      { skipErrorRedirect: true }
    )
  },

  remove(id: number) {
    if (IS_DEMO_MODE) {
      return demoTicketTypeApi.remove()
    }

    return httpClient.delete<ApiResponse<null>>(
      `/api/ticket-types/${id}`,
      { skipErrorRedirect: true }
    )
  }
}
